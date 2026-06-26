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

const RPG_LIGHT = {
	bodyBg: "#d8e8f4",
	panelBg: "#e8f2fa",
	rowBg: "#ccdaea",
	deepRowBg: "#beccde",
	borderSilver: "#2c4a62",
	borderSteel: "#4a6a85",
	borderFaint: "#8aacc4",
	textPrimary: "#0e1820",
	textMuted: "#2c4a62",
};

const FONTS = {
	sans:  '"LatoWiki", "Inter", system-ui, sans-serif',
	mono:  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
	dos:   '"DOSVGA", "Courier New", monospace',
	pixel: '"OrangeKid", "DOSVGA", monospace',
};

export const theme = createTheme({
	fontFamily: FONTS.sans,
	fontFamilyMonospace: FONTS.mono,
	headings: {
		fontFamily: FONTS.pixel,
		fontWeight: "700",
	},

	defaultRadius: 0,
	radius: { xs: rem(0), sm: rem(0), md: rem(0), lg: rem(0), xl: rem(0) },

	shadows: {
		xs: `1px 1px 0px var(--rpg-border-steel)`,
		sm: `2px 2px 0px var(--rpg-border-steel)`,
		md: `3px 3px 0px var(--rpg-border-steel)`,
		lg: `4px 4px 0px var(--rpg-border-steel)`,
		xl: `5px 5px 0px var(--rpg-border-steel)`,
	},

	spacing: {
		xxxs: rem(6),
		xxs: rem(8),
		xs: rem(10),
		sm: rem(12),
		md: rem(16),
		lg: rem(20),
		xl: rem(32),
	},

	primaryColor: "silver",
	primaryShade: { light: 7, dark: 4 },

	colors: {
		silver: [
			"#f0f4f8",
			"#d8e4ec",
			"#baced8",
			"#9ab8c8",
			"#8aacc4",
			"#7a9cb4",
			"#5a7890",
			"#385468",
			"#243440",
			"#141e28",
		],
		dark: [
			RPG.textPrimary,   // 0
			RPG.borderSilver,  // 1
			RPG.textMuted,     // 2
			RPG.borderSteel,   // 3
			RPG.borderFaint,   // 4
			RPG.deepRowBg,     // 5
			RPG.panelBg,       // 6
			RPG.bodyBg,        // 7
			"#060608",         // 8
			"#030305",         // 9
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

	cssVariablesResolver: () => ({
		variables: {},
		dark: {
			// RPG palette tokens
			"--rpg-body-bg":       RPG.bodyBg,
			"--rpg-panel-bg":      RPG.panelBg,
			"--rpg-row-bg":        RPG.rowBg,
			"--rpg-deep-row-bg":   RPG.deepRowBg,
			"--rpg-border-silver": RPG.borderSilver,
			"--rpg-border-steel":  RPG.borderSteel,
			"--rpg-border-faint":  RPG.borderFaint,
			"--rpg-text-primary":  RPG.textPrimary,
			"--rpg-text-muted":    RPG.textMuted,
			"--rpg-navbar-bg":     RPG.panelBg,
			"--rpg-sidebar-bg":    RPG.bodyBg,
			// Override Mantine's built-in tokens so all components follow the palette
			"--mantine-color-body":           RPG.bodyBg,
			"--mantine-color-text":           RPG.textPrimary,
			"--mantine-color-bright":         RPG.textPrimary,
			"--mantine-color-dimmed":         RPG.textMuted,
			"--mantine-color-placeholder":    RPG.textMuted,
			"--mantine-color-default":        RPG.panelBg,
			"--mantine-color-default-border": RPG.borderSteel,
			"--mantine-color-anchor":         RPG.borderSilver,
		},
		light: {
			// RPG palette tokens
			"--rpg-body-bg":       RPG_LIGHT.bodyBg,
			"--rpg-panel-bg":      RPG_LIGHT.panelBg,
			"--rpg-row-bg":        RPG_LIGHT.rowBg,
			"--rpg-deep-row-bg":   RPG_LIGHT.deepRowBg,
			"--rpg-border-silver": RPG_LIGHT.borderSilver,
			"--rpg-border-steel":  RPG_LIGHT.borderSteel,
			"--rpg-border-faint":  RPG_LIGHT.borderFaint,
			"--rpg-text-primary":  RPG_LIGHT.textPrimary,
			"--rpg-text-muted":    RPG_LIGHT.textMuted,
			"--rpg-navbar-bg":     RPG_LIGHT.panelBg,
			"--rpg-sidebar-bg":    RPG_LIGHT.bodyBg,
			// Override Mantine's built-in tokens
			"--mantine-color-body":           RPG_LIGHT.bodyBg,
			"--mantine-color-text":           RPG_LIGHT.textPrimary,
			"--mantine-color-bright":         RPG_LIGHT.textPrimary,
			"--mantine-color-dimmed":         RPG_LIGHT.textMuted,
			"--mantine-color-placeholder":    RPG_LIGHT.textMuted,
			"--mantine-color-default":        RPG_LIGHT.panelBg,
			"--mantine-color-default-border": RPG_LIGHT.borderSteel,
			"--mantine-color-anchor":         RPG_LIGHT.borderSilver,
		},
	}),

	components: {
		Card: {
			styles: {
				root: {
					backgroundColor: "var(--rpg-panel-bg)",
					border: `2px solid var(--rpg-border-silver)`,
					boxShadow: `3px 3px 0px var(--rpg-border-steel)`,
					color: "var(--rpg-text-primary)",
				},
			},
		},

		Button: {
			defaultProps: { variant: "light" },
			styles: (_, props) => ({
				root: {
					color: props.variant === "outline" || props.variant === "light" || !props.variant
						? "var(--rpg-text-primary)"
						: undefined,
					borderColor: props.variant === "outline"
						? "var(--rpg-border-silver)"
						: undefined,
					boxShadow: props.variant === "filled"
						? `2px 2px 0px var(--rpg-border-steel)`
						: undefined,
				},
				label: {
					color: "inherit",
				},
			}),
		},

		ActionIcon: {
			styles: {
				root: {
					color: "var(--rpg-text-primary)",
				},
			},
		},

		Input: {
			styles: {
				input: {
					backgroundColor: "var(--rpg-panel-bg)",
					borderColor: "var(--rpg-border-steel)",
					color: "var(--rpg-text-primary)",
					"&::placeholder": {
						color: "var(--rpg-text-muted)",
					},
				},
				label: {
					color: "var(--rpg-text-muted)",
				},
			},
		},

		NumberInput: {
			styles: {
				input: {
					backgroundColor: "var(--rpg-panel-bg)",
					borderColor: "var(--rpg-border-steel)",
					color: "var(--rpg-text-primary)",
				},
				label: { color: "var(--rpg-text-muted)" },
			},
		},

		Select: {
			styles: {
				input: {
					backgroundColor: "var(--rpg-panel-bg)",
					borderColor: "var(--rpg-border-steel)",
					color: "var(--rpg-text-primary)",
				},
				label: { color: "var(--rpg-text-muted)" },
			},
		},

		Checkbox: {
			styles: {
				label: { color: "var(--rpg-text-primary)" },
				input: {
					borderColor: "var(--rpg-border-steel)",
					backgroundColor: "var(--rpg-panel-bg)",
				},
			},
		},

		Combobox: {
			styles: {
				dropdown: {
					backgroundColor: "var(--rpg-panel-bg)",
					border: `2px solid var(--rpg-border-silver)`,
					boxShadow: `3px 3px 0px var(--rpg-border-steel)`,
				},
				option: {
					color: "var(--rpg-text-primary)",
					"&[data-combobox-selected]": {
						backgroundColor: "var(--rpg-row-bg)",
						color: "var(--rpg-text-primary)",
					},
					"&:hover": {
						backgroundColor: "var(--rpg-row-bg)",
					},
				},
				groupLabel: {
					color: "var(--rpg-border-silver)",
					fontFamily: FONTS.dos,
				},
			},
		},

		Table: {
			styles: {
				th: {
					color: "var(--rpg-border-silver)",
					backgroundColor: "var(--rpg-row-bg)",
					borderColor: "var(--rpg-border-faint)",
					fontFamily: FONTS.dos,
				},
				td: {
					color: "var(--rpg-text-primary)",
					borderColor: "var(--rpg-border-faint)",
				},
				tr: { borderColor: "var(--rpg-border-faint)" },
				table: { borderColor: "var(--rpg-border-silver)" },
			},
		},

		Divider: {
			styles: {
				root: { borderColor: "var(--rpg-border-steel)" },
				label: {
					color: "var(--rpg-border-silver)",
					fontFamily: FONTS.dos,
				},
			},
		},

		Badge: {
			defaultProps: { color: "silver" },
			styles: {
				root: {
					border: `1px solid var(--rpg-border-silver)`,
					backgroundColor: "var(--rpg-row-bg)",
				},
				label: { color: "var(--rpg-border-silver)" },
			},
		},

		Avatar: {
			styles: {
				root: {
					border: `1px solid var(--rpg-border-steel)`,
					backgroundColor: "var(--rpg-panel-bg)",
				},
				placeholder: {
					color: "var(--rpg-border-silver)",
					backgroundColor: "var(--rpg-panel-bg)",
				},
			},
		},

		Drawer: {
			styles: {
				content: {
					backgroundColor: "var(--rpg-panel-bg)",
					borderLeft: `2px solid var(--rpg-border-silver)`,
				},
				header: {
					backgroundColor: "var(--rpg-panel-bg)",
					borderBottom: `1px solid var(--rpg-border-steel)`,
				},
				title: { color: "var(--rpg-text-primary)" },
			},
		},

		Tooltip: {
			styles: {
				tooltip: {
					backgroundColor: "var(--rpg-row-bg)",
					border: `1px solid var(--rpg-border-steel)`,
					color: "var(--rpg-text-primary)",
				},
			},
		},

		ScrollArea: {
			styles: {
				root:     { backgroundColor: "var(--rpg-body-bg)" },
				viewport: { backgroundColor: "var(--rpg-body-bg)" },
			},
		},

		Paper: {
			styles: {
				root: { backgroundColor: "var(--rpg-panel-bg)" },
			},
		},
	},
});
