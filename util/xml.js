/*
	Licencováno pod MIT Licencí, její celý text je uveden v souboru licence.txt
	Licenced under the MIT Licence, complete text is available in licence.txt file
*/

/**
 * @overview Práce s XML
 * @author Zara
 */ 

/**
 * @namespace
 * @group jak-utils
 */
JAK.XML = JAK.ClassMaker.makeStatic({
	NAME: "JAK.XML",
	VERSION: "2.2"
});

/**
 * Vrátí textový obsah uzlu
 * @param {node} node
 * @returns {string}
 */
JAK.XML.textContent = function(node) {
	return node.textContent || node.text || "";
}

/**
 * Vrátí pole potomků, které jsou elementy
 * @param {node} node
 * @param {string} [name] Volitelně filtr na jména prvků
 * @returns {element[]}
 */
JAK.XML.childElements = function(node, name) {
	var arr = [];
	var ch = node.childNodes;
	for (var i=0;i<ch.length;i++) {
		var x = ch[i];
		if (x.nodeType != 1) { continue; }
		if (name && name.toLowerCase() != x.nodeName.toLowerCase()) { continue; }
		arr.push(x);
	}
	return arr;
}

/**
 * Vyrobí XML document z řetěce
 * @param {string} xmlStr
 * @returns {XMLDocument}
 */
JAK.XML.createDocument = function(xmlStr) {
	if (window.DOMParser) {
		return new DOMParser().parseFromString(xmlStr, "text/xml");
	} else if (window.ActiveXObject) {
		var xml = new ActiveXObject("Microsoft.XMLDOM");
		xml.loadXML(xmlStr);
		return xml;
	} else {
		throw new Error("No XML parser available");
	}
}


/**
 * Parsování XMLRPC
 * @namespace
 * @group jak-utils
 */
JAK.XML.RPC = JAK.ClassMaker.makeStatic({
	NAME: "JAK.XML.RPC",
	VERSION: "1.0"
});

/**
 * XML na objekt
 * @param {node} node
 * @returns {object}
 */
JAK.XML.RPC.parse = function(node) {
	return this._valueToObject(node);
}

JAK.XML.RPC._valueToObject = function(node) {
	node = JAK.XML.childElements(node)[0];
	switch (node.nodeName) {
		case "string":
			return node.firstChild.nodeValue;
		break;
		case "i4":
		case "int":
			return parseInt(node.firstChild.nodeValue);
		break;
		case "double":
			return parseFloat(node.firstChild.nodeValue);
		break;
		case "boolean":
			return (node.firstChild.nodeValue == "1");
		break;
		case "array":
			return this._arrayToObject(node);
		break;
		case "struct":
			return this._structToObject(node);
		break;
		case "nil":
			return null;
		break;
		default:
			throw new Error("Unknown XMLRPC node " + node.nodeName);
		break;
	}
}

JAK.XML.RPC._arrayToObject = function(node) {
	var arr = [];
	var data = JAK.XML.childElements(node)[0];
	var values = JAK.XML.childElements(data);
	for (var i=0;i<values.length;i++) {
		arr.push(this._valueToObject(values[i]));
	}
	return arr;
}

JAK.XML.RPC._structToObject = function(node) {
	var obj = {};
	var members = JAK.XML.childElements(node);
	for (var i=0;i<members.length;i++) {
		var member = members[i];
		var name = JAK.XML.childElements(member, "name")[0];
		name = JAK.XML.textContent(name);
		
		var value = JAK.XML.childElements(member, "value")[0];
		obj[name] = this._valueToObject(value);
	}
	return obj;
}
