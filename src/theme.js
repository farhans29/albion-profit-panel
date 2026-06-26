import { createTheme, rem } from "@mantine/core";

const RPG = {
	bodyBg: "#141d28",
	panelBg: "#1a2535",
	rowBg: "#213044",
	deepRowBg: "#131c28",
	borderSilver: "#8aacc4",
	borderSteel: "#4a6a85",
	borderFaint: "#253545",
	textPrimary: "#dde8f2",
	textMuted: "#7a9ab8",
};

const FONTS = {
	sans:  '"LatoWiki", "Inter", system-ui, sans-serif',
	mono:  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
	dos:   '"DOSVGA", "Courier New", monospace',
	pixel: '"OrangeKid", "DOSVGA", monospace',
};

export const theme = createTheme({
	// ── Typography ──────────────────────────────────────────────────────────
	fontFamily: FONTS.sans,
	fontFamilyMonospace: FONTS.mono,
	headings: {
		fontFamily: FONTS.pixel,
		fontWeight: "700",
	},

	// ── Shape — sharp corners everywhere ────────────────────────────────────
	defaultRadius: 0,
	radius: {
		xs: rem(0),
		sm: rem(0),
		md: rem(0),
		lg: rem(0),
		xl: rem(0),
	},

	// Hard pixel shadows — no blur
	shadows: {
		xs: `1px 1px 0px ${RPG.borderSteel}`,
		sm: `2px 2px 0px ${RPG.borderSteel}`,
		md: `3px 3px 0px ${RPG.borderSteel}`,
		lg: `4px 4px 0px ${RPG.borderSteel}`,
		xl: `5px 5px 0px ${RPG.borderSteel}`,
	},

	// ── Spacing (preserve existing tokens) ──────────────────────────────────
	spacing: {
		xxxs: rem(6),
		xxs: rem(8),
		xs: rem(10),
		sm: rem(12),
		md: rem(16),
		lg: rem(20),
		xl: rem(32),
	},

	// ── Colors ───────────────────────────────────────────────────────────────
	primaryColor: "silver",
	primaryShade: { light: 4, dark: 4 },

	colors: {
		silver: [
			"#f0f4f8",
			"#d8e4ec",
			"#baced8",
			"#9ab8c8",
			"#8aacc4", // 4 — primary silver
			"#7a9cb4",
			"#5a7890",
			"#385468", // 7 — dark steel
			"#243440",
			"#141e28",
		],
		// dark[7] → --mantine-color-body, dark[6] → card/input bg,
		// dark[4] → default border, dark[2] → dimmed text
		dark: [
			RPG.textPrimary,  // 0 — primary text
			RPG.borderSilver, // 1 — silver
			RPG.textMuted,    // 2 — dimmed text
			RPG.borderSteel,  // 3 — dark steel border
			RPG.borderFaint,  // 4 — faint border
			RPG.deepRowBg,    // 5 — deep row bg
			RPG.panelBg,      // 6 — panel bg
			RPG.bodyBg,       // 7 — body bg
			"#060608",        // 8
			"#030305",        // 9
		],
		green: [
			"#e8f5e9", "#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a",
			"#4a9e50", "#388e3c", "#2e7d32", "#1b5e20", "#0d3d13",
		],
		red: [
			"#ffebee", "#ffcdd2", "#ef9a9a", "#e57373", "#ef5350",
			"#b83232", "#c62828", "#b71c1c", "#8a1010", "#5a0a0a",
		],
	},

	cursorType: "pointer",

	// ── Component overrides ──────────────────────────────────────────────────
	components: {
		Card: {
			styles: {
				root: {
					backgroundColor: RPG.panelBg,
					border: `2px solid ${RPG.borderSilver}`,
					boxShadow: `3px 3px 0px ${RPG.borderSteel}`,
				},
			},
		},

		Button: {
			defaultProps: { variant: "light" },
			styles: (_, props) => ({
				root: {
					boxShadow:
						props.variant === "filled"
							? `2px 2px 0px ${RPG.borderSteel}`
							: undefined,
				},
			}),
		},

		Input: {
			styles: {
				input: {
					backgroundColor: RPG.panelBg,
					borderColor: RPG.borderSteel,
					color: RPG.textPrimary,
				},
				label: {
					color: RPG.textMuted,
				},
			},
		},

		NumberInput: {
			styles: {
				label: { color: RPG.textMuted },
			},
		},

		Select: {
			styles: {
				label: { color: RPG.textMuted },
			},
		},

		Combobox: {
			styles: {
				dropdown: {
					backgroundColor: RPG.panelBg,
					border: `2px solid ${RPG.borderSilver}`,
					boxShadow: `3px 3px 0px ${RPG.borderSteel}`,
				},
				option: {
					color: RPG.textPrimary,
				},
				groupLabel: {
					color: RPG.borderSilver,
					fontFamily: FONTS.dos,
				},
			},
		},

		Table: {
			styles: {
				th: {
					color: RPG.borderSilver,
					backgroundColor: RPG.rowBg,
					borderColor: RPG.borderFaint,
					fontFamily: FONTS.dos,
				},
				td: {
					color: RPG.textPrimary,
					borderColor: RPG.borderFaint,
				},
				tr: {
					borderColor: RPG.borderFaint,
				},
				table: {
					borderColor: RPG.borderSilver,
				},
			},
		},

		Divider: {
			styles: {
				root: {
					borderColor: RPG.borderSteel,
				},
				label: {
					color: RPG.borderSilver,
					fontFamily: FONTS.dos,
				},
			},
		},

		Badge: {
			defaultProps: { color: "silver" },
			styles: {
				root: {
					border: `1px solid ${RPG.borderSilver}`,
					backgroundColor: RPG.rowBg,
				},
				label: {
					color: RPG.borderSilver,
				},
			},
		},

		Avatar: {
			styles: {
				root: {
					border: `1px solid ${RPG.borderSteel}`,
					backgroundColor: RPG.panelBg,
				},
				placeholder: {
					color: RPG.borderSilver,
					backgroundColor: RPG.panelBg,
				},
			},
		},

		Drawer: {
			styles: {
				content: {
					backgroundColor: RPG.panelBg,
					borderLeft: `2px solid ${RPG.borderSilver}`,
				},
				header: {
					backgroundColor: RPG.panelBg,
					borderBottom: `1px solid ${RPG.borderSteel}`,
				},
			},
		},

		Tooltip: {
			styles: {
				tooltip: {
					backgroundColor: RPG.rowBg,
					border: `1px solid ${RPG.borderSteel}`,
					color: RPG.textPrimary,
				},
			},
		},
	},
});
