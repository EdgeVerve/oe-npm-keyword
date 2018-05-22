/**
 *
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */
'use strict';
var fetch = require('node-fetch');
var Agent = require('https-proxy-agent');
var registryUrl = require('registry-url');
var Promise = require('pinkie-promise');
var config = require('rc')('npm');

function get(keyword, options) {
	if (typeof keyword !== 'string' && !Array.isArray(keyword)) {
		return Promise.reject(new TypeError('Keyword must be either a string or an array of strings'));
	}

	if (options.size < 1 || options.size > 250) {
		return Promise.reject(new TypeError('Size option must be between 1 and 250'));
	}

	keyword = encodeURIComponent(keyword).replace('%2C', '+');

	const url = `${registryUrl()}-/v1/search?text=keywords:${keyword}&size=${options.size}`;

	var fetchOptions = {};

	var proxy = process.env.https_proxy || config['https-proxy'] || config.proxy;

	if(proxy){
		var agent = new Agent(proxy);
		fetchOptions.agent = agent;
	}

	return fetch(url, fetchOptions).then(function (res) {
		if (!res.ok) {
			throw Error(res.statusText);
		}
		return res.json();
	}).then(function(json){
		return json;
	});
}

module.exports = (keyword, options) => {
	options = Object.assign({size: 250}, options);

	return get(keyword, options).then(data => {
		return data.objects.map(el => ({
			name: el.package.name,
			description: el.package.description
		}));
	});
};

module.exports.names = (keyword, options) => {
	options = Object.assign({size: 250}, options);

	return get(keyword, options).then(data => data.objects.map(x => x.package.name));
};

module.exports.count = keyword => {
	return get(keyword, {size: 1}).then(data => data.total);
};
