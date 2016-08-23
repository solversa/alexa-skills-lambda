const get = require('simple-get-promise').get;
const asJson = require('simple-get-promise').asJson;

const helpers = require('../helpers');
const speech = require('../speech').speech;
const sound = require('../speech').sound;
const randomMsg = require('../helpers').randomMessage;

const PAGE_SIZE = 3;

module.exports = function (isNewIntentFlag) {
    // An intent is a new intent unless this is explicitly set to `false`; `undefined` defaults to `true`.
    var isNewIntent = isNewIntentFlag !== false;

    const attributes = this.event.session.attributes;
    attributes.lastIntent = 'GetHeadlines';
    attributes.positionalContent = [];

    if (typeof attributes.moreOffset !== 'undefined') {
        if (isNewIntent) attributes.moreOffset = 0;
        else attributes.moreOffset += PAGE_SIZE;
    }
    else {
        attributes.moreOffset = 0;
    }

    // TODO: check the location - US, UK, AU or International?
    var capiQuery = helpers.capiQuery('uk', 'show-editors-picks=true&show-fields=byline,headline&tag=type/article,tone/news,-tone/minutebyminute');

    get(capiQuery)
        .then(asJson)
        .then((json) => {
            if (json.response.editorsPicks && json.response.editorsPicks.length >= attributes.moreOffset + PAGE_SIZE) {
				this.emit(':ask', generateHeadlinesSpeech(json), speech.headlines.reprompt);
            } else {
                this.emit(':ask', speech.headlines.notfound);
            }
        })
        .catch(function (error) {
            this.emit(':tell', speech.headlines.notfound);
        });


	var generateHeadlinesSpeech = (json) => {
		const preamble = randomMsg(speech.acknowledgement) + ((isNewIntent) ? speech.headlines.top : speech.headlines.more);
		const conclusion = sound.break + speech.headlines.reprompt;

		var getHeadlines = () => {
			return json.response.editorsPicks.slice(attributes.moreOffset, attributes.moreOffset+3).map(editorsPick =>
				editorsPick.fields.headline + sound.transition
			);
		};

		attributes.positionalContent = json.response.editorsPicks.slice(attributes.moreOffset, attributes.moreOffset+3).map(editorsPick =>
		 	editorsPick.id );

		return preamble + getHeadlines() + conclusion;
	}
};
