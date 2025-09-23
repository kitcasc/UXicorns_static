(function ($) {
	window["cozyBlockAccordionInit"] = (e) => {
		const n = e.replace(/-/gi, "_");
		const blockOptions = window[`cozyAccordion_${n}`];
		const accordionClass = `#cozyBlock_${n}`;
		const cozyAccordion = document.querySelector(accordionClass);

		const cozyAccordionItem = cozyAccordion.querySelectorAll(
			".cozy-block-accordion-item",
		);

		cozyAccordionItem.forEach((item) => {
			const title = item.querySelector(".cozy-accordion-title");

			const icon = item.querySelector(".accordion-icon-wrapper svg");
			const iconPath = item.querySelector(".accordion-icon-wrapper svg path");

			title.addEventListener("click", function () {
				const content = this.nextElementSibling;
				if (content) {
					this.classList.toggle("active");
					content.classList.toggle("display-block");
					if (this.classList.contains("active")) {
						icon.setAttribute(
							"viewBox",
							`${blockOptions.icon.activeViewBox.vx} ${blockOptions.icon.activeViewBox.vy} ${blockOptions.icon.activeViewBox.vw} ${blockOptions.icon.activeViewBox.vh}`,
						);
						iconPath.setAttribute("d", blockOptions.icon.activePath);
					}

					if (!this.classList.contains("active")) {
						icon.setAttribute(
							"viewBox",
							`${blockOptions.icon.viewBox.vx} ${blockOptions.icon.viewBox.vy} ${blockOptions.icon.viewBox.vw} ${blockOptions.icon.viewBox.vh}`,
						);
						iconPath.setAttribute("d", blockOptions.icon.path);
					}
				}
			});
		});
	};
})(jQuery);
