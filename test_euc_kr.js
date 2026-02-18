const iconv = require('iconv-lite');

const testString = "테스트 취소"; // "Test Cancel" in Korean
const payload = {
    CANCELREASON: testString
};

const jsonString = JSON.stringify(payload);
console.log("Original JSON:", jsonString);

// Encode
const encoded = iconv.encode(jsonString, 'euc-kr');
console.log("EUC-KR Hex:", encoded.toString('hex'));

// Decode back
const decoded = iconv.decode(encoded, 'euc-kr');
console.log("Decoded JSON:", decoded);

if (jsonString === decoded) {
    console.log("SUCCESS: Encoding/Decoding round trip verified.");
} else {
    console.error("FAILURE: Decoded string does not match original.");
}
