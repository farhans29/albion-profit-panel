import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
	Badge,
	Box,
	Button,
	Card,
	Center,
	Checkbox,
	Divider,
	Drawer,
	Flex,
	Grid,
	Group,
	Image,
	Loader,
	NumberFormatter,
	ScrollArea,
	Space,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { useClipboard, useResizeObserver } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
	IconClipboard,
	IconCoin,
	IconPlus,
	IconShoppingCart,
} from "@tabler/icons-react";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { globalStore } from "@/mobx/rootStore";
import { GroupStore } from "@/mobx/stores/groupStore";
import { ShoppingListStore } from "@/mobx/stores/shoppingListStore.js";
import * as m from "@/paraglide/messages.js";
import classes from "./Home.module.css";
import { ItemGroup } from "./partials/ItemGroup";
import { LanguageSelector } from "./partials/LanguageSelector";
import { ItemImage } from "./partials/ProductRow.jsx";
import { ServerSelector } from "./partials/ServerSelector";
import { ShoppingList, ShoppingListButton } from "./partials/ShoppingList.jsx";
import { getRandomWallpaper } from "./utils/getRandomWallpaper";
import { generateUid } from "./utils/group/generateUid";
import { getGroupParts } from "./utils/group/getGroupParts.js";
import { IndexedDB } from "./utils/IndexedDB/IndexedDB";

function getGroupTotalCost(group) {
	const { product } = getGroupParts(group);
	if (!product) return 0;
	const units = (product.quantity ?? 0) * (product.quantityPerCraft ?? 1);
	return Math.round(units * (product.price ?? 0));
}

function getGroupTaxAmount(group) {
	return Math.round(getGroupTotalCost(group) * (group?.tax ?? 0) / 100);
}

function getGroupGrandTotal(group) {
	return getGroupTotalCost(group) - getGroupTaxAmount(group);
}

export default observer(function Home() {
	const [isInitialized, setIsInitialized] = useState(false);

	/** @type {[GroupStore[], React.Dispatch<React.SetStateAction<GroupStore[]>>]} */
	const [groups, setGroups] = useState([new GroupStore()]);

	const sortedGroups = [...(groups ?? [])].sort((a, b) => a.order - b.order);

	const [showShoppingList, setShowShoppingList] = useState(false);
	const [selectedGroupId, setSelectedGroupId] = useState(null);
	const [shoppingList] = useState(() => new ShoppingListStore());

	const clipboard = useClipboard();

	useEffect(() => {
		shoppingList.buildFromGroups(sortedGroups);
	}, [groups]);

	const [wallpaper] = useState(() => getRandomWallpaper());

	const [resizeObserverRef, rect] = useResizeObserver();

	const [parentAutoAnimate] = useAutoAnimate();

	const isDebugMode = globalStore.debugMode;
	const bindQuantity = globalStore.bindQuantity;

	async function loadFromIndexedDB() {
		try {
			const indexedDb = globalStore.getIndexedDb();
			if (!indexedDb?.db) {
				console.log("IndexedDB not initialized yet");
				return null;
			}

			const groups = await indexedDb.getAll("groups");
			if (groups && groups.length > 0) {
				console.log("Loaded groups from IndexedDB:", groups.length);
				return groups.sort((a, b) => a.order - b.order);
			}
			return null;
		} catch (error) {
			console.error("Error loading from IndexedDB:", error);
			return null;
		}
	}

	async function checkAndFixDuplicateIds(groups) {
		if (!groups || groups.length === 0) {
			return groups;
		}

		const idMap = new Map();
		const duplicateGroups = [];
		const groupsWithFixedItems = [];
		let totalFixedItemIds = 0;

		const indexedDb = globalStore.getIndexedDb();

		for (const group of groups) {
			const id = group.id;
			let groupHasFixedItems = false;

			if (idMap.has(id)) {
				duplicateGroups.push(group);
			} else {
				idMap.set(id, true);
			}

			if (group.items && Array.isArray(group.items)) {
				const itemUidMap = new Map();
				const duplicateItems = [];

				for (const item of group.items) {
					const uid = item.uid;
					if (itemUidMap.has(uid)) {
						duplicateItems.push(item);
					} else {
						itemUidMap.set(uid, true);
					}
				}

				if (duplicateItems.length > 0) {
					console.log(
						`Found ${duplicateItems.length} items with duplicate UIDs in group ${group.id}, fixing...`,
					);
					for (const duplicateItem of duplicateItems) {
						duplicateItem.uid = generateUid();
					}
					totalFixedItemIds += duplicateItems.length;
					groupHasFixedItems = true;
				}
			}

			if (groupHasFixedItems) {
				groupsWithFixedItems.push(group);
			}
		}

		if (totalFixedItemIds > 0) {
			console.log(`Fixed ${totalFixedItemIds} duplicate item IDs`);
		}

		if (indexedDb?.db && groupsWithFixedItems.length > 0) {
			for (const group of groupsWithFixedItems) {
				const groupStore = new GroupStore(group, true);
				await indexedDb.add("groups", groupStore.toPrimitives());
				console.log(`Saved group with fixed item UIDs: ${group.id}`);
			}
		}

		if (duplicateGroups.length === 0) {
			return groups;
		}

		console.log(`Found ${duplicateGroups.length} groups with duplicate IDs, fixing...`);

		if (!indexedDb?.db) {
			console.warn("Cannot fix duplicate IDs: IndexedDB was not available");
			return groups;
		}

		for (const duplicateGroup of duplicateGroups) {
			const newId = generateUid();
			console.log(`Changing duplicate ID from ${duplicateGroup.id} to ${newId}`);

			duplicateGroup.id = newId;

			const groupStore = new GroupStore(duplicateGroup, true);
			await indexedDb.add("groups", groupStore.toPrimitives());
		}

		console.log("All duplicate IDs have been fixed");
		return groups;
	}

	async function recalculateGroupOrders(groups) {
		if (!groups || groups.length === 0) {
			return groups;
		}

		const indexedDb = globalStore.getIndexedDb();
		let ordersChanged = false;

		for (let i = 0; i < groups.length; i++) {
			if (groups[i].order !== i) {
				groups[i].order = i;
				ordersChanged = true;
			}
		}

		if (ordersChanged && indexedDb?.db) {
			for (const group of groups) {
				const groupStore = new GroupStore(group, true);
				await indexedDb.add("groups", groupStore.toPrimitives());
			}
			console.log("Recalculated and saved group orders");
		}

		return groups;
	}

	useEffect(() => {
		(async () => {
			const indexedDB = new IndexedDB();
			await indexedDB.init();
			globalStore.indexedDb = indexedDB;

			const indexedDBGroups = await loadFromIndexedDB();
			const fixedGroups = await checkAndFixDuplicateIds(indexedDBGroups);
			const recalculatedGroups = await recalculateGroupOrders(fixedGroups);

			if (recalculatedGroups && recalculatedGroups.length > 0) {
				const builtGroups = [];

				for (const _group of recalculatedGroups) {
					builtGroups.push(new GroupStore(_group, true));
				}

				setGroups(builtGroups);
			}

			setIsInitialized(true);
		})();
	}, []);

	function handleAddGroup() {
		setGroups((prev) => {
			const groupsClone = [...prev];

			let newOrder = 0;

			for (const _groupStore of groupsClone) {
				if (_groupStore.order > newOrder) {
					newOrder = _groupStore.order;
				}
			}

			const newGroup = new GroupStore({ order: newOrder + 1 });
			groupsClone.push(newGroup);

			// Save the new group to IndexedDB
			const indexedDb = globalStore.getIndexedDb();
			if (indexedDb?.db) {
				indexedDb.add("groups", newGroup.toPrimitives());
			}

			return groupsClone;
		});
	}

	function handleDeleteGroup(id) {
		setGroups((_prev) => {
			const groupsClone = [..._prev];
			const idx = groupsClone.findIndex((_groupStore) => _groupStore.id === id);

			if (idx !== -1) {
				groupsClone.splice(idx, 1);

				// Delete from IndexedDB
				const indexedDb = globalStore.getIndexedDb();
				if (indexedDb?.db) {
					indexedDb.deleteOne("groups", id);
				}
			}

			return groupsClone;
		});
	}

	function handleUpdateGroup(updatedGroup) {
		setGroups((_prev) => {
			const groupsClone = [..._prev];
			const idx = groupsClone.findIndex((_groupStore) => _groupStore.id === updatedGroup.id);

			if (idx !== -1) {
				const newGroupStore = new GroupStore(updatedGroup, true);
				groupsClone[idx] = newGroupStore;
			}

			return groupsClone;
		});
	}

	function handleDuplicateGroup(id) {
		setGroups((_prev) => {
			const groupsClone = [..._prev];
			const idx = groupsClone.findIndex((_groupStore) => _groupStore.id === id);

			if (idx !== -1) {
				const clonedGroup = groupsClone[idx].cloneGroup();

				// Insert the same group after the index
				groupsClone.splice(idx + 1, 0, clonedGroup);

				// Recalculate orders for all groups
				for (let i = 0; i < groupsClone.length; i++) {
					groupsClone[i].order = i;
				}

				// Save all groups to IndexedDB
				const indexedDb = globalStore.getIndexedDb();
				if (indexedDb?.db) {
					for (const group of groupsClone) {
						indexedDb.add("groups", group.toPrimitives());
					}
				}
			}

			return groupsClone;
		});
	}

	function handleMoveGroup(id, direction) {
		setGroups((_prev) => {
			const groupsClone = [..._prev];
			const idx = groupsClone.findIndex((_groupStore) => _groupStore.id === id);

			if (idx === -1) {
				return _prev;
			}

			if (direction === 1 && idx === groupsClone.length - 1) {
				return _prev;
			}
			if (direction === -1 && idx === 0) {
				return _prev;
			}

			const [movedGroup] = groupsClone.splice(idx, 1);
			groupsClone.splice(idx + direction, 0, movedGroup);

			runInAction(() => {
				groupsClone.forEach((group, index) => {
					group.order = index;
				});
			});

			(async () => {
				const indexedDb = globalStore.getIndexedDb();
				if (indexedDb?.db) {
					for (const group of groupsClone) {
						indexedDb.add("groups", group.toPrimitives());
					}
				}
			})();

			return groupsClone;
		});
	}

	async function handleSaveShoppingListChanges() {
		const updatedGroups = shoppingList.getUpdatedGroups(groups);
		const indexedDb = globalStore.getIndexedDb();
		if (indexedDb?.db) {
			for (const group of updatedGroups) {
				await indexedDb.add("groups", group.toPrimitives());
			}
		}
	}

	async function handleClearShoppingList() {
		const updatedGroups = shoppingList.clearItemsInGroups(groups);
		const indexedDb = globalStore.getIndexedDb();
		if (indexedDb?.db) {
			for (const group of updatedGroups) {
				await indexedDb.add("groups", group.toPrimitives());
			}
			setGroups(updatedGroups);
		}
		shoppingList.clearItems();
	}

	const { headerHeight } = useMemo(() => {
		// temporal fix for margin-inline and margin-block... automatically applied by Mantine?
		if (resizeObserverRef?.current?.style?.margin) {
			resizeObserverRef.current.style.margin = 0;
		}

		return {
			headerHeight: rect.height,
		};
	}, [rect]);

	if (!isInitialized) {
		return <Loader />;
	}

	const selectedGroup = sortedGroups.find((group) => group.id === selectedGroupId);

	return (
		<div className={classes.mainContainer} ref={parentAutoAnimate}>
			<Image className={classes.image} src={wallpaper} />

			{/* ── Top Navbar ─────────────────────────────────────────────── */}
			<nav className={classes.navbar} ref={resizeObserverRef}>
				<span className={classes.navbarBrand}>⚔ Albion Profit</span>
				<div className={classes.navbarDivider} />
				<LanguageSelector />
				<ServerSelector />
				<div className={classes.navbarDivider} />
				<Tooltip label={m.bindQuantityTooltip()}>
					<Checkbox
						label={m.bindQuantity()}
						size="xs"
						onChange={(ev) => { globalStore.bindQuantity = ev.target.checked; }}
						checked={bindQuantity}
					/>
				</Tooltip>
				<div className={classes.navbarSpacer} />
				<ShoppingListButton
					value={showShoppingList}
					onClick={(val) => setShowShoppingList(!val)}
					count={shoppingList.items.size}
				/>
			</nav>

			<ScrollArea w="100%">
				<Space h={headerHeight} />

				<Flex direction={{ base: "column", sm: "row" }} p={{ base: "sm", sm: "md" }} gap={{ base: "md", sm: 0 }} w="100%">
					<Card className={classes.leftContainer} p="sm" style={{ top: headerHeight, height: `calc(100vh - ${headerHeight}px)` }}>
						{/* Group list */}
						<Box className={classes.leftContainerList}>
							{sortedGroups?.map((_groupStore, _idx) => {
								const group = _groupStore;
								const { product } = getGroupParts(group);
								const isSelected = selectedGroupId === group.id;

								if (!group) {
									return null;
								}

								const hasItemsInShoppingList = group.atLeastOneItemIsInShoppingList();

								const groupCost = getGroupTotalCost(group);
								const groupTax = getGroupTaxAmount(group);
								const groupGrand = getGroupGrandTotal(group);

								return (
									<Box
										key={group.id}
										className={classes.leftContainerItem}
										mb={2}
										style={{
											cursor: "pointer",
											borderLeft: isSelected
												? "3px solid var(--mantine-color-silver-4)"
												: "3px solid transparent",
											backgroundColor: isSelected
												? "rgba(138, 172, 196, 0.08)"
												: "var(--mantine-color-dark-5)",
										}}
										onClick={() => setSelectedGroupId(group.id)}
									>
										<Group gap="xs" p="xxs" wrap="nowrap">
											<ItemImage itemId={product?.id} />
											<Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
												<Group justify="space-between" wrap="nowrap" gap={4}>
													<Text size="sm" lineClamp={1} style={{ flex: 1 }}>
														{product?.names?.[globalStore.getItemLangKey()]}
													</Text>
													{hasItemsInShoppingList && (
														<IconShoppingCart size={13} color="var(--mantine-color-dimmed)" />
													)}
												</Group>
												<Text c="dimmed" size="xs">
													x{product?.quantity * (product?.quantityPerCraft ?? 1)}
												</Text>
												<Group gap={4}>
													<IconCoin size={12} color="var(--mantine-color-silver-4)" />
													<Text size="xs" ff="monospace" c="silver.4">
														<NumberFormatter
															thousandSeparator={globalStore.thousandSeparator}
															decimalSeparator={globalStore.decimalSeparator}
															value={groupCost}
														/>
													</Text>
												</Group>

												{groupTax > 0 && (
													<Group gap={4}>
														<IconCoin size={12} color="var(--mantine-color-red-4)" />
														<Text size="xs" ff="monospace" c="red.4">
															-<NumberFormatter
																thousandSeparator={globalStore.thousandSeparator}
																decimalSeparator={globalStore.decimalSeparator}
																value={groupTax}
															/>
														</Text>
														<Text size="xs" c="dimmed">{group.tax}% tax</Text>
													</Group>
												)}
											</Stack>
										</Group>
									</Box>
								);
							})}
						</Box>

						{/* Footer */}
						<Box className={classes.leftContainerFooter}>
							<Group justify="space-between" px="xxs" pt="xs">
								<Text size="xs" c="dimmed">Total</Text>
								<Group gap={4}>
									<IconCoin size={13} color="var(--mantine-color-silver-4)" />
									<Text size="xs" ff="monospace" fw="bold" c="silver.4">
										<NumberFormatter
											thousandSeparator={globalStore.thousandSeparator}
											decimalSeparator={globalStore.decimalSeparator}
											value={sortedGroups.reduce((sum, g) => sum + getGroupTotalCost(g), 0)}
										/>
									</Text>
								</Group>
							</Group>

							<Group justify="space-between" px="xxs" py={2}>
								<Text size="xs" c="red.4">Tax</Text>
								<Group gap={4}>
									<IconCoin size={13} color="var(--mantine-color-red-4)" />
									<Text size="xs" ff="monospace" c="red.4">
										-<NumberFormatter
											thousandSeparator={globalStore.thousandSeparator}
											decimalSeparator={globalStore.decimalSeparator}
											value={sortedGroups.reduce((sum, g) => sum + getGroupTaxAmount(g), 0)}
										/>
									</Text>
								</Group>
							</Group>

							<Divider my={4} />

							<Group justify="space-between" px="xxs" pb="xs">
								<Text size="xs" c="green.4" fw="bold">Grand Total</Text>
								<Group gap={4}>
									<IconCoin size={13} color="var(--mantine-color-green-4)" />
									<Text size="xs" ff="monospace" fw="bold" c="green.4">
										<NumberFormatter
											thousandSeparator={globalStore.thousandSeparator}
											decimalSeparator={globalStore.decimalSeparator}
											value={sortedGroups.reduce((sum, g) => sum + getGroupGrandTotal(g), 0)}
										/>
									</Text>
								</Group>
							</Group>

							<Button
								fullWidth
								leftSection={<IconPlus />}
								color="teal"
								variant="outline"
								onClick={() => {
									handleAddGroup();
								}}
							>
								{m.addGroup()}
							</Button>
						</Box>
					</Card>

					<Box className={classes.dataContainer} w="100%">
						{selectedGroup && (
							<ItemGroup
								key={selectedGroup?.id}
								groupStore={selectedGroup}
								index={selectedGroup.order}
								onDelete={({ id }) => {
									handleDeleteGroup(id);
								}}
								onDuplicate={({ id }) => {
									handleDuplicateGroup(id);
								}}
								onMove={({ id, direction }) => {
									handleMoveGroup(id, direction);
								}}
								onUpdate={handleUpdateGroup}
								isSingleColumn={true}
								bindQuantity={bindQuantity}
								isDebugMode={isDebugMode}
							/>
						)}
					</Box>
				</Flex>
			</ScrollArea>

			<Drawer
				opened={showShoppingList}
				size={"xl"}
				onClose={() => setShowShoppingList(false)}
				title={
					<Group>
						<Text fw="bold" ta="center" size="lg">
							Shopping list
						</Text>

						<Badge>BETA</Badge>
					</Group>
				}
				keepMounted={false}
			>
				<ShoppingList
					shoppingList={shoppingList}
					onCopy={(text) => {
						clipboard.copy(text);

						notifications.show({
							color: "green",
							icon: <IconClipboard />,
							title: "Item has been copied to clipboard",
						});
					}}
					onClear={handleClearShoppingList}
					onEdit={handleSaveShoppingListChanges}
				/>
			</Drawer>
		</div>
	);
});
