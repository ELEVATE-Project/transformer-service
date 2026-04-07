'use strict'

const emptyFieldSanitizer = (obj) => {
	if (Array.isArray(obj)) {
		const filteredArray = obj.map(emptyFieldSanitizer).filter((val) => val)
		return filteredArray.length ? filteredArray : undefined
	}
	if (typeof obj !== 'object' || obj === null) return obj
	for (let key in obj) {
		if (obj[key] === '') delete obj[key]
		else {
			obj[key] = emptyFieldSanitizer(obj[key])
			if (!obj[key]) {
				delete obj[key]
			}
		}
	}
	return Object.keys(obj).length ? obj : undefined
}

module.exports = { emptyFieldSanitizer }
