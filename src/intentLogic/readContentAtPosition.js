const get = require('simple-get-promise').get;
const asJson = require('simple-get-promise').asJson;
const striptags = require('striptags');

const helpers = require('../helpers');
const speech = require('../speech').speech;
const sound = require('../speech').sound;

module.exports = function (position) {

	var readContentAtPosition = (position) => {
		const contentId = this.event.session.attributes.positionalContent[position];
		const capiQuery = helpers.capiQuery(contentId, '&show-fields=body');
		get(capiQuery)
			.then(asJson)
			.then((json) => {
				var articleBody = striptags(json.response.content.fields.body);
				this.emit(':ask', articleBody + sound.break + speech.core.readPositionalAtContent);
			})
			.catch(function (error) {
				this.emit(':ask', speech.core.didNotUnderstand);
			})
	};
	
	switch(position) {
		case 'first':
		case '1st':
			readContentAtPosition(0);
			break;
		case 'second':
		case '2nd':
			readContentAtPosition(1);
			break;
		case 'third':
		case '3rd':
			readContentAtPosition(2);
			break;
		default:
			this.emit(':ask', speech.core.didNotUnderstand);
	}

};

