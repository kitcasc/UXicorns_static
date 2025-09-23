function getThemePalette() {
  let palette = [];
  if (typeof themeColor.palette === "object") {
    // Loop through the array of objects using for...of
    for (let key in themeColor.palette) {
      palette.push({
        name: themeColor.palette[key].name,
        color: themeColor.palette[key].color,
      });
    }
  }
  return palette;
}
