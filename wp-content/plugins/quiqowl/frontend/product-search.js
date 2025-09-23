// Debounce function
function debounce(func, delay) {
  let timeoutId;

  return function (...args) {
    const context = this;

    // Clear the previous timeout
    clearTimeout(timeoutId);

    // Set a new timeout
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

let wooCurrency = "$";

const loaderSVG = `<svg class="loader-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M7.99998 2.66666C9.72665 2.66666 11.2626 3.48666 12.238 4.762L10.6666 6.33333H14.6666V2.33333L13.1873 3.81266C12.5631 3.03781 11.773 2.41284 10.8753 1.98376C9.97754 1.55467 8.99499 1.33241 7.99998 1.33333C4.31798 1.33333 1.33331 4.318 1.33331 8H2.66665C2.66665 6.58551 3.22855 5.22896 4.22874 4.22876C5.22894 3.22857 6.58549 2.66666 7.99998 2.66666ZM13.3333 8C13.3333 9.11533 12.9837 10.2026 12.3336 11.1089C11.6835 12.0151 10.7656 12.6948 9.7091 13.0522C8.65259 13.4096 7.51062 13.4268 6.44382 13.1014C5.37703 12.776 4.4391 12.1243 3.76198 11.238L5.33331 9.66666H1.33331V13.6667L2.81265 12.1873C3.43687 12.9622 4.22694 13.5872 5.12468 14.0162C6.02242 14.4453 7.00497 14.6676 7.99998 14.6667C11.682 14.6667 14.6666 11.682 14.6666 8H13.3333Z" />
  </svg>
  `;

let hasNextScroll = true;
let contentLoaded = 0;
let initalQuota = 0;
let isDataLoading = false;

(($) => {
  window["quiqOwlProductSearch"] = (e) => {
    const n = e.replace(/-/gi, "_");
    const blockID = `#quiqowlBlock_${n}`;
    const attributes = window[`quiqowlBlock_${n}`];

    wooCurrency = attributes["wooCurrency"];

    const $body = $("body");
    const $searchBar = $(blockID + " .search-bar");

    const $spinner = $(blockID + " .spinner");
    const $searchResultsLabel = $(blockID + " #search-results__label");
    const $productCollection = $(blockID + " #search-results");

    initalQuota = attributes.ajaxLoader.limit;

    // Ajax Loader Constants
    const ajaxLoaderVariation = attributes.ajaxLoader.variation;

    $searchBar.on("keypress", function (e) {
      var query = $(this).val(); // Get the value of the search input

      if (e.which === 13 && !query) {
        // Enter key pressed
        e.preventDefault(); // Prevent form submission
      }
    });
    $(blockID + ".layout-default .search-icon__wrapper").on(
      "click",
      function (e) {
        let query = $searchBar.val();

        if (!query) {
          // Enter key pressed
          e.preventDefault(); // Prevent form submission
        }
      }
    );

    function showAjaxLoader(variation, showMain = false, showInner = false) {
      const ajaxWrapper = $(blockID + " .qb__ajax-loader-wrapper");
      const btnLoadContainer = $(blockID + " .ajax-loader__container");

      if (showMain) {
        $(ajaxWrapper).removeClass("display-none");

        if (variation === "default") {
          const btnLabel = $(blockID + " .ajax-loader__label");
          if (showInner) {
            $(btnLabel).addClass("display-none");
            $(btnLoadContainer).removeClass("display-none");
          } else {
            $(btnLabel).removeClass("display-none");
            $(btnLoadContainer).addClass("display-none");
          }
        } else if (variation === "scroll") {
          if (showInner) {
            $(btnLoadContainer).removeClass("display-none");
          } else {
            $(btnLoadContainer).addClass("display-none");
          }
        }
      } else {
        $(ajaxWrapper).addClass("display-none");
        $(btnLoadContainer).addClass("display-none");
      }
    }

    // Toast Message
    function showToast(message, productID, type = "success") {
      // Reset to default.
      $(blockID + ` #product-${productID} .quiqowl__toast`).removeClass(
        "is-success"
      );
      $(blockID + ` #product-${productID} .quiqowl__toast`).removeClass(
        "is-error"
      );
      $(blockID + " #tick-icon").hide(); // Show tick icon for success
      $(blockID + " #cross-icon").hide(); // Show tick icon for success
      $(blockID + ` #product-${productID} .toast__message`).text("");

      $(blockID + ` #product-${productID} .toast__message`).text(message);
      $(blockID + ` #product-${productID} .quiqowl__toast`)
        .fadeIn(400)
        .delay(2000)
        .fadeOut(400);

      if (type === "success") {
        $(blockID + " #tick-icon").show(); // Show tick icon for success
        $(blockID + ` #product-${productID} .quiqowl__toast`).addClass(
          "is-success"
        );
      } else if (type === "error") {
        $(blockID + " #cross-icon").show();
        $(blockID + ` #product-${productID} .quiqowl__toast`).addClass(
          "is-error"
        );
      }
    }

    function addProductLinkHandler() {
      $(
        blockID +
          " .product-view__link, " +
          ".quiqowl-block__product-quick-view .product-view__link"
      ).on("click", function (e) {
        const productLink = $(this).attr("href");
        const productID = $(this).data("product-id");

        // Check if the action is meant to open in a new tab
        const isNewTab =
          e.ctrlKey || e.metaKey || $(this).attr("target") === "_blank";

        if (!isNewTab) {
          // If not a new tab, delay navigation until the AJAX request fires
          e.preventDefault();
        }

        $.ajax({
          url: attributes.ajaxUrl, // Replace with your server-side URL
          type: "POST",
          data: {
            action: "quiqowl_update_product_view",
            nonce: attributes.productLinkHandler,
            productId: productID,
          },
          success: function (response) {
            console.log("Product view updated!");

            if (!isNewTab) {
              window.location.href = productLink;
            }
          },
          error: function () {
            console.log("Oops! Error updating product view!");

            if (!isNewTab) {
              window.location.href = productLink;
            }
          },
        });
      });
    }

    // Trigger Ajax Search
    function ajaxSearchCall() {
      var query = $searchBar.val(); // Get the value of the search input

      const category = $(blockID + " .category__dropdown").val();

      const minPrice = $(blockID + " #quiqowl__min-range").val();
      const maxPrice = $(blockID + " #quiqowl__max-range").val();

      // Create an array to store selected values
      let selectedTags = [];
      $(blockID + ' input[name="product_tags[]"]:checked').each(function () {
        selectedTags.push($(this).val());
      });

      const rating = $(blockID + " .rating__filter-option.selected").data(
        "rating"
      );

      let $paOptions = [];
      $(blockID + " .attribute-filter__item").each(function () {
        $id = $(this).attr("id");

        $selectedOptions = $(this)
          .find(`input[name="selected_${$id}[]"]:checked`)
          .map(function () {
            return $(this).val();
          })
          .get();

        if ($selectedOptions.length > 0) {
          $paOptions.push({
            attribute_name: $id,
            value: $selectedOptions,
          });
        }
      });

      if (query.length <= 2) {
        setTimeout(() => {
          // Remove loader
          $spinner.addClass("display-none");
          $productCollection.removeClass("opacity-30");
        }, 1000);
      }

      if (query.length > 2 || query.length <= 0) {
        // Optional: Only search if query length is greater than 2
        $.ajax({
          url: attributes.ajaxUrl, // Replace with your server-side URL
          type: "POST",
          data: {
            action: "quiqowl_product_search_results",
            nonce: attributes.nonce,
            search: query,
            category: category,
            minPrice: minPrice,
            maxPrice: maxPrice,
            rating: rating,
            tags: JSON.stringify(selectedTags),
            wcProductAttributes: JSON.stringify($paOptions),
            attributes: JSON.stringify(attributes),
          }, // Send the search query as data
          success: function (response) {
            // Remove loader
            $spinner.addClass("display-none");
            $productCollection.removeClass("opacity-30");

            if (query) {
              $searchResultsLabel.removeClass("display-none");
              $searchResultsLabel.html(
                `${response.data.products_count} item(s) found for: "${query}"`
              );
            } else {
              $searchResultsLabel.addClass("display-none");
              $searchResultsLabel.empty();
            }

            // Handle the response here
            $(blockID + " #search-results").html(response.data.render); // Update the results div with the returned data

            // Product Views Handler
            addProductLinkHandler();

            // Add to cart
            $(blockID + " .cart-icon__wrapper").on(
              "click",
              debounce(function () {
                // Append the loader svg.
                $(this).find("svg").hide();
                $(this).append(loaderSVG);

                const productID = $(this).data("product-id");
                $.ajax({
                  url: attributes.ajaxUrl,
                  type: "POST",
                  data: {
                    action: "quiqowl_add_to_cart",
                    cartNonce: attributes.cartNonce,
                    productId: productID,
                  },
                  success: function (response) {
                    // Remove the loader svg.
                    $(blockID + " .cart-icon__wrapper")
                      .find(".loader-icon")
                      .remove();
                    $(blockID + " .cart-icon__wrapper")
                      .find("svg")
                      .show();

                    if (response.success) {
                      // Show Toast
                      showToast("Cart Updated!", productID, "success");

                      $(
                        blockID +
                          ` #product-${productID} .product__cart-page-link`
                      ).removeClass("display-none");
                    } else {
                      showToast("Error occurred!", productID, "error");
                    }
                  },
                  error: function (xhr, status, error) {
                    // Remove the loader svg.
                    $(blockID + " .cart-icon__wrapper")
                      .find(".loader-icon")
                      .remove();
                    $(blockID + " .cart-icon__wrapper")
                      .find("svg")
                      .show();

                    // Show Toast
                    showToast("Error occurred!", productID, "error");
                  },
                });
              }, 300)
            );

            // Quick View
            $(blockID + " .quick-view-icon__wrapper").on(
              "click",
              debounce(function () {
                // Open Lighbox
                $(".quiqowl-block__product-quick-view").removeClass("hidden");
                $body.addClass("quiqowl__overflow-hidden");

                const productID = $(this).data("product-id");

                // Ajax to load lightbox data
                $.ajax({
                  url: attributes.ajaxUrl, // Replace with your server-side URL
                  type: "POST",
                  data: {
                    action: "quiqowl_lightbox_data",
                    lightboxNonce: attributes.lightboxNonce,
                    productId: productID,
                    attributes: JSON.stringify(attributes),
                  },
                  success: function (response) {
                    if (response.success) {
                      // Hide Spinner
                      $(".quiqowl-block__product-quick-view .spinner").addClass(
                        "hidden"
                      );

                      $(
                        ".quiqowl-block__product-quick-view .quiqowl-block__product-container"
                      ).html(response.data.render);

                      // Product Views Handler
                      addProductLinkHandler();

                      // Increase quantity
                      $(".quiqowl-lightbox__quantity .quantity__increase").on(
                        "click",
                        function () {
                          let quantity = Math.abs(
                            parseInt(
                              $(
                                ".quiqowl-lightbox__quantity .quiqowl-lightbox__quantity-input"
                              ).val()
                            )
                          );
                          $(
                            ".quiqowl-lightbox__quantity .quiqowl-lightbox__quantity-input"
                          ).val(quantity + 1);

                          const newQuantity = quantity + 1;

                          if (newQuantity > 1) {
                            $(
                              ".quiqowl-lightbox__quantity .quantity__decrease"
                            ).removeClass("opacity-50");
                          }
                        }
                      );

                      // Decrease quantity
                      $(
                        ".quiqowl-lightbox__quantity .quantity__decrease"
                      ).click(function () {
                        let quantity = Math.abs(
                          parseInt(
                            $(
                              ".quiqowl-lightbox__quantity .quiqowl-lightbox__quantity-input"
                            ).val()
                          )
                        );
                        const newQuantity = quantity - 1;

                        if (newQuantity > 0) {
                          $(
                            ".quiqowl-lightbox__quantity .quiqowl-lightbox__quantity-input"
                          ).val(quantity - 1);
                        } else {
                          $(
                            ".quiqowl-lightbox__quantity .quiqowl-lightbox__quantity-input"
                          ).val(1);
                        }

                        if (newQuantity <= 1) {
                          $(this).addClass("opacity-50");
                        } else {
                          $(this).removeClass("opacity-50");
                        }
                      });

                      // Add to cart functionality.
                      $(".quiqowl-lightbox__cart-button").on(
                        "click",
                        function () {
                          const cartButtonContainer = $(this);
                          // Append the loader svg.
                          $(cartButtonContainer).find("span").hide();
                          $(cartButtonContainer).append(loaderSVG);

                          $.ajax({
                            url: attributes.ajaxUrl, // Replace with your server-side URL
                            type: "POST",
                            data: {
                              action: "quiqowl_add_to_cart",
                              cartNonce: attributes.cartNonce,
                              productId: productID,
                              productQuantity: parseInt(
                                $(".quiqowl-lightbox__quantity-input").val()
                              ),
                            },
                            success: function () {
                              $(cartButtonContainer)
                                .find(".loader-icon")
                                .remove();
                              $(cartButtonContainer).find("span").show();

                              $(".quiqowl-lightbox__cart-tooltip").removeClass(
                                "quiqowl__visibility-hidden"
                              );
                              setTimeout(() => {
                                $(".quiqowl-lightbox__cart-tooltip").addClass(
                                  "quiqowl__visibility-hidden"
                                );
                              }, 3000);
                            },
                            error: function (xhr, status, error) {},
                          });
                        }
                      );

                      const swiperContainer = document.querySelector(
                        ".quiqowl-lightbox__review.swiper__container"
                      );
                      const bullets = document.querySelector(
                        ".quiqowl-lightbox__review.swiper__container .swiper-pagination"
                      );

                      /* Rating Slider */
                      const sliderAttr = {
                        init: true,
                        slidesPerView: 1,
                        loop: true,
                        spaceBetween: 26,
                        autoplay: {
                          delay: 1500,
                          pauseOnMouseEnter: true,
                        },
                        speed: 1500,
                        pagination: {
                          el: bullets,
                          clickable: true,
                        },
                      };

                      const ratingSlider = new Swiper(
                        swiperContainer,
                        sliderAttr
                      );
                    }
                  },
                  error: function (xhr, status, error) {
                    console.log("Unable to fetch lightbox data.");
                  },
                });
              }, 100)
            );

            /* Show/Hide Ajax Loader */
            if (
              ajaxLoaderVariation === "default" &&
              response.data.has_ajax_loader
            ) {
              showAjaxLoader(ajaxLoaderVariation, true);
            } else if (
              ajaxLoaderVariation === "scroll" &&
              response.data.has_ajax_loader
            ) {
              let $container = $(blockID + " .quiqowl-block__search-modal");
              if (
                $(window).width() <= 1024 &&
                attributes.layout === "default"
              ) {
                $container = $(blockID);
              } else if (attributes.layout === "full") {
                $container = $(blockID + " .qo-lightbox__body");
              }
              var hasVerticalScroll =
                $container[0].scrollHeight > $container.innerHeight();

              if (hasVerticalScroll) {
                $container.on(
                  "scroll",
                  debounce(function () {
                    var scrollTop = $container.scrollTop();
                    var scrollHeight = $container[0].scrollHeight;
                    var containerHeight = $container.innerHeight();

                    // Check if the user has scrolled to the bottom
                    if (scrollTop + containerHeight >= scrollHeight) {
                      console.log(
                        "Reached the bottom of the container",
                        hasNextScroll
                      );

                      showAjaxLoader(ajaxLoaderVariation, true, true);
                      if (hasNextScroll && !isDataLoading) {
                        debounce(fetchAjaxLoaderRenderData(), 300);
                      } else {
                        showAjaxLoader(ajaxLoaderVariation, false);
                      }
                    }
                  }, 300)
                );
              }
            } else {
              showAjaxLoader(ajaxLoaderVariation, false);
            }

            ajaxLoading = false;
          },
          error: function (xhr, status, error) {
            console.log("AJAX Error:", status, error);
          },
        });
      } else {
        // $(blockID + " #search-results").empty(); // Clear the results if the query is too short
      }
    }

    // Close Quick View Lightbox
    function closeQuickViewLightbox() {
      $(".quiqowl-block__product-quick-view").addClass("hidden");

      if (attributes.layout === "default") {
        $body.removeClass("quiqowl__overflow-hidden");
      }

      // Show Spinner
      $(".quiqowl-block__product-quick-view .spinner").removeClass("hidden");

      // Empty the product container content.
      $(
        ".quiqowl-block__product-quick-view .quiqowl-block__product-container"
      ).html("");
    }

    $searchBar.on(
      "input",
      debounce(function () {
        $spinner.removeClass("display-none");
        $productCollection.addClass("opacity-30");
        ajaxSearchCall();
      }, 500)
    );
    // Trigger ajaxSearchCall() when the select control value changes
    $(blockID + " .category__dropdown").on(
      "change",
      debounce(function () {
        $spinner.removeClass("display-none");
        $productCollection.addClass("opacity-30");
        ajaxSearchCall();
      }, 300)
    );

    // Price Filter.
    $(blockID + " .quiqowl__price-range").on(
      "change",
      debounce(function () {
        $spinner.removeClass("display-none");

        $productCollection.addClass("opacity-30");
        ajaxSearchCall();
      }, 300)
    );

    // Tag Filter
    $(blockID + ' input[name="product_tags[]"]').change(
      debounce(function () {
        $spinner.removeClass("display-none");
        $productCollection.addClass("opacity-30");
        ajaxSearchCall();
      }, 300)
    );

    // Rating Filter
    $ratingResetBtn = $(blockID + " .rating__filter .reset__icon");
    $ratingFilterOption = $(blockID + " .rating__filter-option");

    $ratingResetBtn.on("click", function () {
      // Check if any element has the 'selected' class
      if ($ratingFilterOption.hasClass("selected")) {
        // Remove 'selected' class from the filter options
        $ratingFilterOption.removeClass("selected");

        // Hide reset button.
        $(this).hide();

        // Show the spinner and adjust opacity
        $spinner.removeClass("display-none");
        $productCollection.addClass("opacity-30");
        // Trigger the AJAX search call
        ajaxSearchCall();
      }
    });
    // Rating filter select option
    $ratingFilterOption.on(
      "click",
      debounce(function () {
        $ratingFilterOption.removeClass("selected");

        $(this).addClass("selected");
        $ratingResetBtn.show();

        $spinner.removeClass("display-none");
        $productCollection.addClass("opacity-30");
        ajaxSearchCall();
      }, 300)
    );

    // Attribute Filter
    if (attributes.attrFilter.enabled) {
      // Reset Options Event
      $(blockID + " .attribute-filter__item .reset__icon").on(
        "click",
        debounce(function () {
          $id = $(this).attr("id");

          $(`input[name="selected_${$id}[]"]`).prop("checked", false);

          $(this).addClass("quiqowl__visibility-hidden");

          $spinner.removeClass("display-none");
          $productCollection.addClass("opacity-30");

          ajaxSearchCall();
        }, 300)
      );

      $(blockID + ' .attribute-filter__item input[type="checkbox"]').on(
        "change",
        debounce(function () {
          $name = $(this).attr("name");
          $class = $(this).attr("class");

          $selectedOptions = $(
            blockID + ` .attribute-filter__item input[name="${$name}"]:checked`
          )
            .map(function () {
              return $(this).val();
            })
            .get();

          // Show Reset Icon
          $resetIcon = $(blockID + ` #${$class}.attribute-filter__item`).find(
            ".reset__icon"
          );
          if ($selectedOptions.length > 0) {
            $resetIcon.removeClass("quiqowl__visibility-hidden");
          } else {
            $resetIcon.addClass("quiqowl__visibility-hidden");
          }

          $spinner.removeClass("display-none");
          $productCollection.addClass("opacity-30");

          ajaxSearchCall();
        }, 300)
      );
    }

    /* Toggle Fullscreen mode for smaller devices */
    function toggleFullScreenMode() {
      if (attributes.layout === "default") {
        if ($(window).width() <= 1024) {
          $(blockID).addClass("has-full-screen"); // Add the class if screen width is <= 768px
          $body.addClass("quiqowl__overflow-hidden");
        } else {
          $(blockID).removeClass("has-full-screen"); // Remove the class if screen width is > 768px
          $body.removeClass("quiqowl__overflow-hidden");
        }
      }
    }
    // Bind the function to the resize event
    $(window).resize(function () {
      if (
        !$(blockID + " .quiqowl-block__search-modal").hasClass("display-none")
      ) {
        toggleFullScreenMode();
      }
    });

    $searchBar.on("focus", function () {
      toggleFullScreenMode();
      let isOpened = false;

      if (
        !$(blockID + " .quiqowl-block__search-modal").hasClass("display-none")
      ) {
        isOpened = true;
      }
      // Remove the 'display-none' class from the search modal when the input is focused
      $(blockID + " .quiqowl-block__search-modal").removeClass("display-none");

      if (!isOpened) {
        $spinner.removeClass("display-none");
        $(blockID + " .search-results__product-collection").addClass(
          "opacity-30"
        );
        ajaxSearchCall();
      }
    });

    // Hide the search modal when clicking outside of it
    $(document).on("click", function (event) {
      const $block = $(blockID);
      const $spinner = $block.find(".spinner");
      const $searchResults = $block.find(".search-results__product-collection");
      const $searchBar = $block.find(
        ".search-bar__wrapper.show-on-click .search-bar"
      );

      // Check if the click is outside the search input and the search modal
      if (
        !$block.is(event.target) &&
        !$block.has(event.target).length &&
        !$(event.target).closest(".quiqowl-block__product-quick-view").length
      ) {
        $block.find(".quiqowl-block__search-modal").addClass("display-none");

        hasNextScroll = true;
        contentLoaded = 0;
        quota = initalQuota;

        $searchResults.html("");

        if (!$spinner.hasClass("display-none")) {
          $spinner.addClass("display-none");
        }

        if ($searchResults.hasClass("opacity-30")) {
          $searchResults.removeClass("opacity-30");
        }

        if (
          attributes.searchBar.showOnClick &&
          attributes.searchButton.variation === "outside"
        ) {
          $searchBar.addClass("width-none");

          // Remove min-width to make siblings take up the space in only icon mode.
          $(`.quiqowl-block__wrapper[data-block-id="quiqowlBlock_${n}"]`).css(
            "min-width",
            "auto"
          );
        }
      }
    });
    // Exit Fullscreen search modal for responsive view
    $(blockID + " #back__arr").on("click", function () {
      $(blockID).removeClass("has-full-screen"); // Remove the class if screen width is > 768px
      $(blockID + " .quiqowl-block__search-modal").addClass("display-none");
      $body.removeClass("quiqowl__overflow-hidden");
    });

    /* Quick View Mode */
    if ($("body .quiqowl-block__product-quick-view").length <= 0) {
      $body.append(
        `<div class="quiqowl-block__product-quick-view hidden">
            <div class="quiqowl-block__quick-view-body">
  
              <div class="quiqowl-block__close-icon-wrapper" >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.99999 7.058L11.3 3.758L12.2427 4.70067L8.94266 8.00067L12.2427 11.3007L11.2993 12.2433L7.99932 8.94334L4.69999 12.2433L3.75732 11.3L7.05732 8L3.75732 4.7L4.69999 3.75867L7.99999 7.058Z" />
                </svg>
              </div>
  
              <div class="spinner"></div>
  
              <div class="quiqowl-block__product-container">
              
              </div>
  
            </div>
          </div>`
      );
    }

    $(".quiqowl-block__close-icon-wrapper").on("click", function () {
      closeQuickViewLightbox();
    });
    // Event handler for clicking inside the modal
    $(".quiqowl-block__product-quick-view").on("click", function (event) {
      // Check if the clicked target is the modal itself
      if ($(event.target).is(".quiqowl-block__product-quick-view")) {
        closeQuickViewLightbox(); // Close the modal if clicked outside of content
      }
    });

    // Search Field Show on Click
    $(blockID + " .search-bar__wrapper.show-on-click .search-icon__wrapper").on(
      "click",
      function () {
        // Apply min. width for the search bar
        function applyResponsiveWidth(n, attributes) {
          const block = $(
            `.quiqowl-block__wrapper[data-block-id="quiqowlBlock_${n}"]`
          );

          // Get viewport width
          const viewportWidth = $(window).width();

          // Apply width based on viewport size
          if (viewportWidth >= 1024) {
            // Desktop
            block.css("min-width", attributes.styles.responsive.desktop.width);
          } else if (viewportWidth >= 768) {
            // Tablet
            block.css("min-width", attributes.styles.responsive.tablet.width);
          } else {
            // Mobile
            block.css("min-width", attributes.styles.responsive.mobile.width);
          }
        }
        // Make the element visible immediately to allow animation
        $(
          blockID + " .search-bar__wrapper.show-on-click .search-bar"
        ).removeClass("width-none");

        if (
          attributes.searchBar.showOnClick &&
          attributes.searchButton.variation === "outside"
        ) {
          // Call function initially
          applyResponsiveWidth(n, attributes);

          // Re-apply on window resize
          $(window).resize(function () {
            applyResponsiveWidth(n, attributes);
          });
        }
      }
    );

    /* ----------------------------------------------------------------------- */
    // Full Screen Mode
    const $lightbox = $(blockID + ".layout-full .qo__lightbox");

    function closeFullscreenLightbox() {
      // $(blockID + " .qo-lightbox__body").scrollTop(0);

      $body.removeClass("quiqowl__overflow-hidden"); // Show overflow in body
      // Show Lighbox
      $lightbox.addClass("display-none");

      hasNextScroll = true;
      contentLoaded = 0;
      quota = initalQuota;

      $productCollection.html("");
    }

    $(blockID + ".layout-full .search-icon__wrapper").on("click", function () {
      $body.addClass("quiqowl__overflow-hidden"); // Hide overflow in body
      // Show Lighbox
      $lightbox.removeClass("display-none");

      $spinner.removeClass("display-none");
      $productCollection.addClass("opacity-30");

      debounce(ajaxSearchCall(), 300);
    });

    // Close Lightbox
    $(blockID + " .qo-lightbox__close-icon-wrapper").on("click", function () {
      closeFullscreenLightbox();
    });

    $($lightbox).on("click", function (event) {
      if (event.target === this) {
        closeFullscreenLightbox();
      }
    });

    /* ------------------------------------------------------------------------ */
    // Ajax Loader
    const ajaxLoaderBtn = $(blockID + " .qb__ajax-loader");
    let quota = parseInt(attributes.ajaxLoader.limit);

    function fetchAjaxLoaderRenderData() {
      isDataLoading = true;

      var query = $searchBar.val(); // Get the value of the search input

      const category = $(blockID + " .category__dropdown").val();

      const minPrice = $(blockID + " #quiqowl__min-range").val();
      const maxPrice = $(blockID + " #quiqowl__max-range").val();

      // Create an array to store selected values
      let selectedTags = [];
      $(blockID + ' input[name="product_tags[]"]:checked').each(function () {
        selectedTags.push($(this).val());
      });

      const rating = $(blockID + " .rating__filter-option.selected").data(
        "rating"
      );

      let $paOptions = [];
      $(blockID + " .attribute-filter__item").each(function () {
        $id = $(this).attr("id");

        $selectedOptions = $(this)
          .find(`input[name="selected_${$id}[]"]:checked`)
          .map(function () {
            return $(this).val();
          })
          .get();

        if ($selectedOptions.length > 0) {
          $paOptions.push({
            attribute_name: $id,
            value: $selectedOptions,
          });
        }
      });

      const productIds = $(".product-collection__item")
        .map(function () {
          // Step 2: Extract only the numeric part of the id attribute
          return $(this).attr("id").replace("product-", "");
        })
        .get();

      // Ajax Call
      $.ajax({
        url: attributes.ajaxUrl,
        type: "POST",
        data: {
          action: "quiqowl_ajax_load_data",
          nonce: attributes.ajaxLoaderNonce,
          limit: attributes.ajaxLoader.limit,
          quota: quota,
          offset: attributes.ajaxLoader.loadContent,
          contentLoaded: contentLoaded,
          search: query,
          category: category,
          minPrice: minPrice,
          maxPrice: maxPrice,
          rating: rating,
          tags: JSON.stringify(selectedTags),
          wcProductAttributes: JSON.stringify($paOptions),
          attributes: JSON.stringify(attributes),
          productIds: JSON.stringify(productIds),
        },
        success: function (response) {
          isDataLoading = false;

          if (response.success) {
            const $searchResultsCollection = $($productCollection).find(
              ".search-results__product-collection"
            );
            $($searchResultsCollection).append(response.data.render);

            if (!response.data.has_next) {
              showAjaxLoader(ajaxLoaderVariation, false);
              hasNextScroll = false;
            } else {
              showAjaxLoader(ajaxLoaderVariation, true, false);
            }

            contentLoaded = response.data.content_loaded;

            quota = response.data.quota;

            // Product Views Handler
            addProductLinkHandler();

            // Add to cart
            $(blockID + " .cart-icon__wrapper").on(
              "click",
              debounce(function () {
                // Append the loader svg.
                $(this).find("svg").hide();
                $(this).append(loaderSVG);

                const productID = $(this).data("product-id");
                $.ajax({
                  url: attributes.ajaxUrl,
                  type: "POST",
                  data: {
                    action: "quiqowl_add_to_cart",
                    cartNonce: attributes.cartNonce,
                    productId: productID,
                  },
                  success: function (response) {
                    // Remove the loader svg.
                    $(blockID + " .cart-icon__wrapper")
                      .find(".loader-icon")
                      .remove();
                    $(blockID + " .cart-icon__wrapper")
                      .find("svg")
                      .show();

                    if (response.success) {
                      // Show Toast
                      showToast("Cart Updated!", productID, "success");

                      $(
                        blockID +
                          ` #product-${productID} .product__cart-page-link`
                      ).removeClass("display-none");
                    } else {
                      showToast("Error occurred!", productID, "error");
                    }
                  },
                  error: function (xhr, status, error) {
                    // Remove the loader svg.
                    $(blockID + " .cart-icon__wrapper")
                      .find(".loader-icon")
                      .remove();
                    $(blockID + " .cart-icon__wrapper")
                      .find("svg")
                      .show();

                    // Show Toast
                    showToast("Error occurred!", productID, "error");
                  },
                });
              }, 300)
            );

            // Quick View
            $(blockID + " .quick-view-icon__wrapper").on(
              "click",
              debounce(function () {
                // Open Lighbox
                $(".quiqowl-block__product-quick-view").removeClass("hidden");
                $body.addClass("quiqowl__overflow-hidden");

                const productID = $(this).data("product-id");

                // Ajax to load lightbox data
                $.ajax({
                  url: attributes.ajaxUrl, // Replace with your server-side URL
                  type: "POST",
                  data: {
                    action: "quiqowl_lightbox_data",
                    lightboxNonce: attributes.lightboxNonce,
                    productId: productID,
                    attributes: JSON.stringify(attributes),
                  },
                  success: function (response) {
                    if (response.success) {
                      // Hide Spinner
                      $(".quiqowl-block__product-quick-view .spinner").addClass(
                        "hidden"
                      );

                      $(
                        ".quiqowl-block__product-quick-view .quiqowl-block__product-container"
                      ).html(response.data.render);

                      // Product Views Handler
                      addProductLinkHandler();

                      // Increase quantity
                      $(".quiqowl-lightbox__quantity .quantity__increase").on(
                        "click",
                        function () {
                          let quantity = Math.abs(
                            parseInt(
                              $(
                                ".quiqowl-lightbox__quantity .quiqowl-lightbox__quantity-input"
                              ).val()
                            )
                          );
                          $(
                            ".quiqowl-lightbox__quantity .quiqowl-lightbox__quantity-input"
                          ).val(quantity + 1);

                          const newQuantity = quantity + 1;

                          if (newQuantity > 1) {
                            $(
                              ".quiqowl-lightbox__quantity .quantity__decrease"
                            ).removeClass("opacity-50");
                          }
                        }
                      );

                      // Decrease quantity
                      $(
                        ".quiqowl-lightbox__quantity .quantity__decrease"
                      ).click(function () {
                        let quantity = Math.abs(
                          parseInt(
                            $(
                              ".quiqowl-lightbox__quantity .quiqowl-lightbox__quantity-input"
                            ).val()
                          )
                        );
                        const newQuantity = quantity - 1;

                        if (newQuantity > 0) {
                          $(
                            ".quiqowl-lightbox__quantity .quiqowl-lightbox__quantity-input"
                          ).val(quantity - 1);
                        } else {
                          $(
                            ".quiqowl-lightbox__quantity .quiqowl-lightbox__quantity-input"
                          ).val(1);
                        }

                        if (newQuantity <= 1) {
                          $(this).addClass("opacity-50");
                        } else {
                          $(this).removeClass("opacity-50");
                        }
                      });

                      // Add to cart functionality.
                      $(".quiqowl-lightbox__cart-button").on(
                        "click",
                        function () {
                          const cartButtonContainer = $(this);
                          // Append the loader svg.
                          $(cartButtonContainer).find("span").hide();
                          $(cartButtonContainer).append(loaderSVG);

                          $.ajax({
                            url: attributes.ajaxUrl, // Replace with your server-side URL
                            type: "POST",
                            data: {
                              action: "quiqowl_add_to_cart",
                              cartNonce: attributes.cartNonce,
                              productId: productID,
                              productQuantity: parseInt(
                                $(".quiqowl-lightbox__quantity-input").val()
                              ),
                            },
                            success: function () {
                              $(cartButtonContainer)
                                .find(".loader-icon")
                                .remove();
                              $(cartButtonContainer).find("span").show();

                              $(".quiqowl-lightbox__cart-tooltip").removeClass(
                                "quiqowl__visibility-hidden"
                              );
                              setTimeout(() => {
                                $(".quiqowl-lightbox__cart-tooltip").addClass(
                                  "quiqowl__visibility-hidden"
                                );
                              }, 3000);
                            },
                            error: function (xhr, status, error) {},
                          });
                        }
                      );

                      const swiperContainer = document.querySelector(
                        ".quiqowl-lightbox__review.swiper__container"
                      );
                      const bullets = document.querySelector(
                        ".quiqowl-lightbox__review.swiper__container .swiper-pagination"
                      );

                      /* Rating Slider */
                      const sliderAttr = {
                        init: true,
                        slidesPerView: 1,
                        loop: true,
                        spaceBetween: 26,
                        autoplay: {
                          delay: 1500,
                          pauseOnMouseEnter: true,
                        },
                        speed: 1500,
                        pagination: {
                          el: bullets,
                          clickable: true,
                        },
                      };

                      const ratingSlider = new Swiper(
                        swiperContainer,
                        sliderAttr
                      );
                    }
                  },
                  error: function (xhr, status, error) {
                    console.log("Unable to fetch lightbox data.");
                  },
                });
              }, 100)
            );
          }
        },
        error: function (error, xhr, status) {
          console.log("Oops! Unable to fetch data!");

          showAjaxLoader(ajaxLoaderVariation, false);
        },
      });
    }

    // Variation Default
    if ($(ajaxLoaderBtn).hasClass("variation-default")) {
      $(ajaxLoaderBtn).on("click", function () {
        // Show Loader
        showAjaxLoader(ajaxLoaderVariation, true, true);

        debounce(fetchAjaxLoaderRenderData(), 300);
      });
    }
  };
})(jQuery);

// Price range slider
document.addEventListener("DOMContentLoaded", () => {
  const COLOR_TRACK = "#CBD5E1";
  const COLOR_RANGE = "#4f43ff94";

  // Get the sliders and tooltips
  const fromSlider = document.querySelector("#quiqowl__min-range");
  const minToolTip = document.querySelector("#quiqowl__min-price bdi");
  const toSlider = document.querySelector("#quiqowl__max-range");
  const maxToolTip = document.querySelector("#quiqowl__max-price bdi");

  // Get min and max values from the fromSlider element
  const MIN = fromSlider ? parseInt(fromSlider.getAttribute("min")) : 0; // scale will start from min value (first range slider)
  const MAX = fromSlider ? parseInt(fromSlider.getAttribute("max")) : 0; // scale will end at max value (first range slider)

  function controlFromSlider(fromSlider, toSlider) {
    const [from, to] = getParsed(fromSlider, toSlider);
    fillSlider(fromSlider, toSlider, COLOR_TRACK, COLOR_RANGE, toSlider);
    if (from > to) {
      fromSlider.value = to;
    }
    setTooltip(fromSlider, minToolTip);
  }

  function controlToSlider(fromSlider, toSlider) {
    const [from, to] = getParsed(fromSlider, toSlider);
    fillSlider(fromSlider, toSlider, COLOR_TRACK, COLOR_RANGE, toSlider);
    setToggleAccessible(toSlider);
    if (from <= to) {
      toSlider.value = to;
    } else {
      toSlider.value = from;
    }
    setTooltip(toSlider, maxToolTip);
  }

  function getParsed(currentFrom, currentTo) {
    const from = parseInt(currentFrom.value, 10);
    const to = parseInt(currentTo.value, 10);
    return [from, to];
  }

  function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
    const rangeDistance = to.max - to.min;
    const fromPosition = from.value - to.min;
    const toPosition = to.value - to.min;
    controlSlider.style.background = `linear-gradient(
          to right,
          ${sliderColor} 0%,
          ${sliderColor} ${(fromPosition / rangeDistance) * 100}%,
          ${rangeColor} ${(fromPosition / rangeDistance) * 100}%,
          ${rangeColor} ${(toPosition / rangeDistance) * 100}%, 
          ${sliderColor} ${(toPosition / rangeDistance) * 100}%, 
          ${sliderColor} 100%)`;
  }

  function setToggleAccessible(currentTarget) {
    const toSlider = document.querySelector("#quiqowl__max-range");
    if (Number(currentTarget.value) <= 0) {
      toSlider.style.zIndex = 2;
    } else {
      toSlider.style.zIndex = 0;
    }
  }

  function setTooltip(slider, tooltip) {
    const value = slider.value;
    tooltip.textContent = `${wooCurrency + "" + value}`;
    const thumbPosition = (value - slider.min) / (slider.max - slider.min);
    const percent = thumbPosition * 100;
    const markerWidth = 20; // Width of the marker in pixels
    const offset = (((percent - 50) / 50) * markerWidth) / 2;
    // tooltip.style.left = `calc(${percent}% - ${offset}px)`;
  }

  function createScale(min, max, step) {
    const range = max - min;
    const steps = range / step;
    for (let i = 0; i <= steps; i++) {
      const value = min + i * step;
      const percent = ((value - min) / range) * 100;
      const marker = document.createElement("div");
      marker.style.left = `${percent}%`;
      marker.textContent = `${wooCurrency + "" + value}`;
    }
  }

  // events
  if (fromSlider) {
    fromSlider.oninput = () => controlFromSlider(fromSlider, toSlider);
  }

  if (toSlider) {
    toSlider.oninput = () => controlToSlider(fromSlider, toSlider);
  }

  // Initial load
  if (fromSlider && toSlider) {
    fillSlider(fromSlider, toSlider, COLOR_TRACK, COLOR_RANGE, toSlider);
    setToggleAccessible(toSlider);
  }
  createScale(MIN, MAX);
});
