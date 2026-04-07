'use strict'

exports.getCount = (elasticDocs) => {
	return elasticDocs.hits.total.value
}

exports.getDocs = (elasticDocs) => {
	return elasticDocs.hits.hits
}

exports.getSourceObject = (elasticDoc) => {
	return elasticDoc._source
}

exports.flattenArrayOfArrays = async (arrayOfArrays) => {
	const accumulator = []
	for (let i = 0; i < arrayOfArrays.length; i++) {
		const innerArray = arrayOfArrays[i]
		if (innerArray.length != 0) {
			for (let j = 0; j < innerArray.length; j++) {
				accumulator.push(innerArray[j])
			}
		}
	}
	return accumulator
}
