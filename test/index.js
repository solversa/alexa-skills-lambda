const tap = require('tap');

const headLinesJson = require('./fixtures/getHeadlines.json');
const headLineSectionJson = require('./fixtures/getHeadlinesForSection.json');
const opinionJson = require('./fixtures/getOpinionOn.json');
const reviewJson = require('./fixtures/getReview.json');
const posAfterHeadJson = require('./fixtures/positionalContentAfterHeadlines.json');
const moreAfterHeadlines = require('./fixtures/moreAfterHeadlines.json');
const moreAfterTechHeadlines = require('./fixtures/moreAfterTechHeadlines.json');

const speech = require('../src/speech').speech;

var lambda = require('../src/index').handler;

tap.test('Test get headlines intent', test => {
    test.plan(3);
    lambda(
        headLinesJson, {
            succeed: function (response) {
                test.equal(response.sessionAttributes.lastIntent, "GetHeadlinesIntent");
                test.equal(response.sessionAttributes.positionalContent.length, 3);
                test.ok(response.response.outputSpeech.ssml.indexOf('break time') != -1);
                test.end()
            },
            fail: function (error) {
                test.fail()
            }
        });
    }
);

tap.test('Test get headlines intent with a specific section', test => {
    test.plan(4);
    lambda(
        headLineSectionJson, {
            succeed: function (response) {
                test.equal(response.sessionAttributes.lastIntent, "GetHeadlinesIntent");
                test.equal(response.sessionAttributes.positionalContent.length, 3);
                test.ok(response.response.outputSpeech.ssml.indexOf('break time') != -1);
                test.equal(response.sessionAttributes.sectionType, 'politics');
                test.end()
            },
            fail: function (error) {
                test.fail()
            }
        });
    }
);

tap.test('Test the get opinion intent', test => {
    test.plan(2);
    lambda(
        opinionJson, {
            succeed: function (response) {
                test.ok(response.response.outputSpeech.ssml);
                test.equal(response.sessionAttributes.lastIntent, "GetOpinionIntent");
                test.end()
            },
            fail: function (error) {
                test.fail()
            }
        });
    }
);

tap.test('Test the get {type} review on {something} intent', test => {
        test.plan(2);
        lambda(
            reviewJson, {
                succeed: function (response) {
                    test.ok(response.response.outputSpeech.ssml.indexOf('Houellebecq') != -1);
                    test.match(response, {
                        sessionAttributes: {
                             lastIntent: 'GetReviewIntent',
                            reviewsRead: 1,
                            lastReviewType: 'book',
                            lastSearchTerm: 'houellebecq'
                        }
                    });
                    test.end()
                },
                fail: function (error) {
                    test.fail()
                }
            });
    }
);

tap.test('Test numeric position after headlines', test => {
        test.plan(3);
        lambda(
            posAfterHeadJson, {
                succeed: function (response) {
                    test.ok(response.response.outputSpeech.ssml.indexOf("Two former health ministers") != -1);
                    test.ok(response.response.outputSpeech.ssml.indexOf("written by") != -1);
                    test.ok(response.response.outputSpeech.ssml.indexOf("minutes to read") != -1);
                    test.end()
                },
                fail: function (error) {
                    test.fail()
                }
            });
    }
);

tap.test('Test more intent after headlines', test => {
        test.plan(2);
        lambda(
            moreAfterHeadlines, {
                succeed: function (response) {
                    test.ok(response.response.outputSpeech.ssml.indexOf("the next three stories are") != -1);
                    test.equal(response.sessionAttributes.moreOffset, 6);
                    test.end();
                },
                fail: function (error) {
                    test.fail()
                }
            });
    }
);

tap.test('Test more intent after tech headlines', test => {
        test.plan(2);
        lambda(
            moreAfterTechHeadlines, {
                succeed: function (response) {
                    test.ok(response.response.outputSpeech.ssml.indexOf("the next 3 technology stories are") != -1);
                    test.equal(response.sessionAttributes.moreOffset, 3);
                    test.end();
                },
                fail: function (error) {
                    test.fail()
                }
            });
    }
);
