"use strict";
(globalThis["webpackChunk_formstr_web_app"] = globalThis["webpackChunk_formstr_web_app"] || []).push([["formstr-sdk_dist_form-schemas_v1_form-spec_json"],{

/***/ "../formstr-sdk/dist/form-schemas/v1/form-spec.json":
/*!**********************************************************!*\
  !*** ../formstr-sdk/dist/form-schemas/v1/form-spec.json ***!
  \**********************************************************/
/***/ ((module) => {

module.exports = JSON.parse('{"$schema":"http://json-schema.org/draft-07/schema#","title":"Form Spec Schema v1","type":"object","properties":{"schemaVersion":{"type":"string","examples":["v1","v2"]},"name":{"type":"string","description":"The name of the form"},"metadata":{},"settings":{"type":"object","description":"Various settings to be used in the form.","properties":{"selfSignForms":{"type":"boolean","description":"Whether force users to self sign the form using nostr"},"description":{"type":"string","description":"Some description about the form"}}},"fields":{"type":"array","items":{"type":"object","properties":{"question":{"type":"string","description":"Can be any string"},"answerType":{"type":"string","enum":["shortText","paragraph","radioButton","checkboxes","dropdown","number","date","label","time"],"description":"Can only be one of the above enums"},"answerSettings":{"type":"object","description":"holds settings of an object","properties":{"choices":{"type":"array","description":"This will be used when answer type will be radioButton or checkboxes","items":{"type":"object","properties":{"label":{"type":"string"},"isOther":{"type":"boolean","description":"There should only be one instance of otherMessage in a given question. User will be presented an input box for selection"}},"required":["label"]}},"numberConstraints":{"type":"object","description":"This will be used when answer type will be number","properties":{"max":{"type":"number"},"min":{"type":"number"}},"required":["max","min"]}}}},"required":["question","answerType"]}}},"required":["schemaVersion","name"]}');

/***/ })

}]);