import {
	ActionIcon,
	Checkbox,
	Grid,
	Group,
	Image,
	Input,
	NumberInput,
	Select,
	Stack,
	Text,
	ThemeIcon,
	Tooltip,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
	IconArrowLeft,
	IconArrowRight,
	IconClipboard,
	IconHelp,
	IconLock,
	IconShoppingCartMinus,
	IconShoppingCartPlus,
	IconTrash,
} from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { globalStore } from "@/mobx/rootStore";
import { PRICE_MODES } from "@/mobx/stores/groupStore";
import * as m from "@/paraglide/messages.js";
import { albionData } from "../../../data/items";

export const LockedPriceButton = ({ item, onChange = {} }) => {
	return (
		<Tooltip label={m.priceIsLockedTooltip()}>
			<ThemeIcon
				size="sm"
				variant="transparent"
				color={item.isLocked ? "blue.3" : "gray.9"}
				style={{ cursor: "pointer" }}
				onClick={() => {
					onChange({
						uid: item.uid,
						isLocked: !item.isLocked,
					});
				}}
			>
				<IconLock />
			</ThemeIcon>
		</Tooltip>
	);
};

// ── Item search index — built once per language, shared across all rows ────
const _itemListCache = {};   // langKey → { value, label }[]
const _searchIndex = new Map(); // value → lowercase label (for fast lookup)
const _itemByValue = new Map(); // value → { value, label } (for selected-item lookup)

function getItemList(langKey) {
	if (_itemListCache[langKey]) return _itemListCache[langKey];

	const list = [];
	for (const _item of albionData) {
		const name = _item.LocalizedNames?.[langKey];
		if (!name) continue;

		const id = _item.UniqueName;
		const parts = id.match(/T([0-9])[^@]*@?([0-9])?/);
		const tier = parts?.[1] ?? "";
		const enchant = parts?.[2] ?? "0";
		const prefix = tier ? `T${tier}.${enchant} ` : "";
		const label = `${prefix}${name}`;
		const entry = { value: id, label };

		list.push(entry);
		_searchIndex.set(id, label.toLowerCase());
		_itemByValue.set(id, entry);
	}

	_itemListCache[langKey] = list;
	return list;
}

function searchItems(itemList, query, limit = 24) {
	if (!query.trim()) return itemList.slice(0, limit);
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
	const results = [];
	for (const item of itemList) {
		if (results.length >= limit) break;
		const s = _searchIndex.get(item.value) ?? "";
		if (terms.every((t) => s.includes(t))) results.push(item);
	}
	return results;
}

// Mantine Select only ever receives ≤24 items — no internal processing of 2500+ entries.
const ItemSelect = memo(({ label, itemList, value, onChange }) => {
	const [search, setSearch] = useState("");

	const visibleOptions = useMemo(() => {
		const results = searchItems(itemList, search);
		// Always keep the selected item in the list so Mantine can display its label.
		if (value && !results.some((r) => r.value === value)) {
			const selected = _itemByValue.get(value);
			if (selected) results.unshift(selected);
		}
		return results;
	}, [search, itemList, value]);

	return (
		<Select
			label={label}
			placeholder="Pick value"
			data={visibleOptions}
			value={value}
			searchValue={search}
			onSearchChange={setSearch}
			onChange={onChange}
			searchable
			filter={({ options }) => options}
		/>
	);
});

export const ItemImage = ({ itemId, onCopy }) => {
	return (
		<Image
			h={56}
			w={56}
			src={
				itemId
					? `https://render.albiononline.com/v1/item/${itemId}.png`
					: "https://render.albiononline.com/v1/spell/HASTE.png"
			}
			mt={6}
			onClick={onCopy}
			style={{ cursor: "pointer" }}
			onError={(ev) => {
				ev.currentTarget.src = "https://render.albiononline.com/v1/spell/HASTE.png";
			}}
		/>
	);
};

export const ProductRow = observer(
	/**
	 * @param {Object} props
	 * @param {import("@/mobx/stores/groupStore").ItemGroupElement} props.item
	 * @param {(props: import("@/mobx/stores/groupStore").ItemGroupElement) => void} props.onChange
	 * @param {() => void} props.onDelete
	 * @param {(item: import("@/mobx/stores/groupStore").ItemGroupElement) => void} props.onShoppingListClick
	 * @param {boolean} props.isHighlighted
	 * @param {boolean} props.hasFetchedPrices
	 * @param {boolean} props.withOmit
	 */
	({
		label,
		item = {},
		onChange = () => {},
		onDelete,
		onShoppingListClick,
		isHighlighted = false,
		withOmit = false,
		hasFetchedPrices = false,
		tax = 0,
	}) => {
		const clipboard = useClipboard();

		const language = globalStore.language;

		const itemList = useMemo(
			() => getItemList(globalStore.getItemLangKey()),
			[language],
		);

		function handleChange(newItem = {}) {
			onChange({
				uid: item?.uid, // mandatory to identify the item
				...newItem,
			});
		}

		// Always points to the latest handleChange; stable identity across renders.
		const handleChangeRef = useRef(handleChange);
		handleChangeRef.current = handleChange;
		const handleSelectChange = useCallback(
			(value) => handleChangeRef.current({ id: value }),
			[],
		);

		function handlePriceModeChange() {
			/** @type {import("@/mobx/stores/groupStore").PriceMode} */
			const nextPriceMode =
				item.priceMode === PRICE_MODES.sell ? PRICE_MODES.buyOrder : PRICE_MODES.sell;
			const nextPrice =
				nextPriceMode === PRICE_MODES.buyOrder ? item.buyOrderPrice : item.sellPrice;

			handleChange({
				priceMode: nextPriceMode,
				price: nextPrice,
			});
		}

		function handleCopyItemId() {
			clipboard.copy(currentItemName);

			notifications.show({
				color: "green",
				icon: <IconClipboard />,
				title: "Item has been copied to clipboard",
			});
		}

		const style = {
			backgroundColor: "var(--mantine-color-dark-5)",
			opacity: item.isActive === false ? 0.6 : undefined,
		};

		if (isHighlighted) {
			style.borderRadius = 4;
			style.backgroundColor = "var(--mantine-color-dark-5)";
		}

		const calculatedTotal = Math.round(
			item?.quantity * item?.price * (item?.quantityPerCraft ?? 1),
		);

		const isProduct = item?.type === "product";
		const isInShoppingList = item.isInShoppingList;

		const priceModeIsSell = item.priceMode === PRICE_MODES.sell;

		function buildInpuSelectedStyle(requiredPriceMode) {
			const isRequiredPriceMode = item.priceMode === requiredPriceMode;

			return {
				color: isRequiredPriceMode ? "var(--mantine-color-blue-4)" : undefined,
				opacity: isRequiredPriceMode ? undefined : 0.4,
			};
		}

		return (
			<Grid h="100%" style={style} p="xxs">
				<Grid.Col span="content">
					<ItemImage itemId={item?.id} onCopy={handleCopyItemId} />
				</Grid.Col>

				<Grid.Col span="content">
					<Stack gap="xxs">
						<Group>
							<ItemSelect
							label={label}
							itemList={itemList}
							value={item?.id}
							onChange={handleSelectChange}
						/>
							<Group gap="xs" wrap="nowrap">
								<NumberInput
									label={<Text size="xs">{m.sellPrice()}</Text>}
									allowNegative={false}
									allowDecimal={false}
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									hideControls
									w={100}
									value={item?.sellPrice}
									onChange={(val) =>
										handleChange({
											price: val,
											sellPrice: val,
											priceMode: PRICE_MODES.sell,
											isLocked: true,
										})
									}
									rightSection={
										<LockedPriceButton
											item={item}
											onChange={({ isLocked }) => handleChange({ isLocked })}
										/>
									}
									error={!item?.price}
									style={buildInpuSelectedStyle(PRICE_MODES.sell)}
								/>

								<Input.Wrapper label=" ">
									<Group justify="center">
										<Tooltip label={m.priceModeSwitchTooltip()}>
											<ActionIcon
												size="sm"
												variant="light"
												onClick={handlePriceModeChange}
											>
												{priceModeIsSell ? (
													<IconArrowLeft />
												) : (
													<IconArrowRight />
												)}
											</ActionIcon>
										</Tooltip>
									</Group>
								</Input.Wrapper>

								<NumberInput
									label={<Text size="xs">{m.buyPrice()}</Text>}
									allowNegative={false}
									allowDecimal={false}
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									hideControls
									w={100}
									value={item?.buyOrderPrice}
									onChange={(val) =>
										handleChange({
											price: val,
											buyOrderPrice: val,
											priceMode: PRICE_MODES.buyOrder,
											isLocked: true,
										})
									}
									rightSection={
										<LockedPriceButton
											item={item}
											onChange={({ isLocked }) => handleChange({ isLocked })}
										/>
									}
									error={!item?.price}
									style={buildInpuSelectedStyle(PRICE_MODES.buyOrder)}
								/>
							</Group>

							{isProduct && (
								<NumberInput
									label={
										<Group wrap="nowrap" gap="xxxs">
											<Text size="sm" fw="500">
												Return %
											</Text>
											<Tooltip
												w={200}
												multiline
												label={m.returnRateTooltip()}
											>
												<ThemeIcon
													size="sm"
													variant="transparent"
													color="gray.5"
												>
													<IconHelp />
												</ThemeIcon>
											</Tooltip>
										</Group>
									}
									allowNegative={true}
									allowDecimal={false}
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									hideControls
									w={100}
									value={item?.returnRate}
									min={0}
									max={100}
									onChange={(val) => handleChange({ returnRate: val })}
								/>
							)}
						</Group>

						<Group>
							{isProduct && (
								<NumberInput
									label={m.perCraft()}
									allowNegative={false}
									allowDecimal={false}
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									min={1}
									max={999_999}
									w={90}
									value={item?.quantityPerCraft ?? 1}
									onChange={(val) => {
										handleChange({ quantityPerCraft: val });
									}}
									prefix="× "
								/>
							)}
							<NumberInput
								label={m.quantity()}
								allowNegative={false}
								allowDecimal={false}
								thousandSeparator={globalStore.thousandSeparator}
								decimalSeparator={globalStore.decimalSeparator}
								min={1}
								max={999_999}
								w={90}
								value={item?.quantity}
								onChange={(val) => handleChange({ quantity: val })}
								prefix="x "
							/>

							{isProduct && (
								<NumberInput
									variant="filled"
									label={m.units()}
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									hideControls
									w={75}
									value={item?.quantity * item?.quantityPerCraft}
									readOnly
								/>
							)}

							<NumberInput
								variant="filled"
								label={m.totalSilver()}
								thousandSeparator={globalStore.thousandSeparator}
								decimalSeparator={globalStore.decimalSeparator}
								hideControls
								w={120}
								value={calculatedTotal}
								readOnly
							/>

							{isProduct && tax > 0 && (
								<NumberInput
									variant="filled"
									label="Grand Total"
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									hideControls
									w={120}
									value={Math.round(calculatedTotal * (1 - tax / 100))}
									readOnly
									styles={{ input: { color: "var(--mantine-color-green-5)", fontWeight: 700 } }}
								/>
							)}

							{hasFetchedPrices && !item?.price && item?.id && (
								<Text size="xs" c="red.5">
									{m.priceNotFound()}
								</Text>
							)}

							{withOmit && !isProduct && (
								<Checkbox
									label={m.active()}
									size="sm"
									checked={item?.isActive !== false}
									onChange={(e) =>
										handleChange({ isActive: e.currentTarget.checked })
									}
								/>
							)}
						</Group>
					</Stack>
				</Grid.Col>

				<Grid.Col span="auto">
					<Input.Wrapper label=" ">
						<Group gap="xs" pr="xs" justify="flex-end">
							{onShoppingListClick && (
								<Tooltip
									label={
										isInShoppingList
											? m.removeFromShoppingList()
											: m.addToShoppingList()
									}
								>
									<ActionIcon
										variant="subtle"
										onClick={() => {
											onShoppingListClick(item);
										}}
										color={isInShoppingList ? "gray" : "blue"}
									>
										{isInShoppingList ? (
											<IconShoppingCartMinus />
										) : (
											<IconShoppingCartPlus />
										)}
									</ActionIcon>
								</Tooltip>
							)}

							{onDelete && (
								<Tooltip label={m.deleteThisComponent()}>
									<ActionIcon color="red" variant="subtle" onClick={onDelete}>
										<IconTrash />
									</ActionIcon>
								</Tooltip>
							)}
						</Group>
					</Input.Wrapper>
				</Grid.Col>
			</Grid>
		);
	},
);
