function quiqowlRenderTRBL(type, attributes) {
	const sides = ["top", "right", "bottom", "left"];

	// Helper function to generate CSS properties conditionally
	const generateProperty = (prop, side) =>
		attributes[side] ? `${prop}-${side}: ${attributes[side]};` : "";

	// Handle border shorthand and individual borders
	switch (type) {
		case "border":
			// Check if any global border property exists
			if (attributes?.width || attributes?.style || attributes?.color) {
				return `
						${attributes?.width ? `border-width: ${attributes?.width};` : ""}
						${attributes?.style ? `border-style: ${attributes?.style};` : ""}
						${attributes?.color ? `border-color: ${attributes?.color};` : ""}
					`;
			} else if (
				attributes?.top ||
				attributes?.right ||
				attributes?.bottom ||
				attributes?.left
			) {
				// Handle individual borders for each side
				return sides
					.map((side) =>
						attributes[side]?.width &&
						attributes[side]?.style &&
						attributes[side]?.color
							? `border-${side}: ${attributes[side].width} ${attributes[side].style} ${attributes[side].color};`
							: ""
					)
					.join("\n");
			}

			break;

		case "radius":
			// Handle individual border radius for each side
			return `
                ${
									attributes.top
										? `border-top-left-radius: ${attributes.top};`
										: ""
								}
                ${
									attributes.right
										? `border-top-right-radius: ${attributes.right};`
										: ""
								}
                ${
									attributes.bottom
										? `border-bottom-right-radius: ${attributes.bottom};`
										: ""
								}
                ${
									attributes.left
										? `border-bottom-left-radius: ${attributes.left};`
										: ""
								}
            `;
			break;

		case "padding":
			// Handle padding for each side
			return sides.map((side) => generateProperty("padding", side)).join("\n");
			break;

		default:
			return "";
	}
}

function premiumNotice(url) {
	return `<div class="quiqowl-block__upsell-notice"><a href="${url}" target="_blank" rel="noopener noreferrer">Upgrade to PRO!</a></div>`;
}
