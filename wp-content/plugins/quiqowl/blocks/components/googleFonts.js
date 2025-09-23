function getFontOptions() {
	let fontOptions = [ { label: 'Default', value: '' } ];
	if ( typeof quiqOwlAssets.googleFonts === 'object' ) {
		// Loop through the array of objects using for...of
		for ( let key in quiqOwlAssets.googleFonts ) {
			fontOptions.push( {
				label: quiqOwlAssets.googleFonts[ key ],
				value: key,
			} );
		}
	}
	return fontOptions;
}