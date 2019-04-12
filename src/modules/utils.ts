import * as SGmail from '@sendgrid/mail';

// converts binary string to a hexadecimal string
// returns an object with key 'valid' to a boolean value, indicating
// if the string is a valid binary string.
// If 'valid' is true, the converted hex string can be obtained by
// the 'result' key of the returned object
const bin2hex = (s: string) => {
		let i: number;
		let k: number;
		let part: string;
		let accum: number;
		let ret = '';
		for (i = s.length-1; i >= 3; i -= 4) {
				// extract out in substrings of 4 and convert to hex
				part = s.substr(i+1-4, 4);
				accum = 0;
				for (k = 0; k < 4; k += 1) {
						if (part[k] !== '0' && part[k] !== '1') {
								// invalid character
								return { valid: false };
						}
						// compute the length 4 substring
						accum = accum * 2 + parseInt(part[k], 10);
				}
				if (accum >= 10) {
						// 'A' to 'F'
						ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
				} else {
						// '0' to '9'
						ret = String(accum) + ret;
				}
		}
		// remaining characters, i = 0, 1, or 2
		if (i >= 0) {
				accum = 0;
				// convert from front
				for (k = 0; k <= i; k += 1) {
						if (s[k] !== '0' && s[k] !== '1') {
								return { valid: false };
						}
						accum = accum * 2 + parseInt(s[k], 10);
				}
				// 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
				ret = String(accum) + ret;
		}
		return { valid: true, result: ret };
};

interface Table {
	[key: string]: string;
}

// converts hexadecimal string to a binary string
// returns an object with key 'valid' to a boolean value, indicating
// if the string is a valid hexadecimal string.
// If 'valid' is true, the converted binary string can be obtained by
// the 'result' key of the returned object
const hex2bin = (s: string) => {
		let i: number;
		let ret: string = '';
		// lookup table for easier conversion. '0' characters are padded for '1' to '7'
		const lookupTable = {
				0: '0000', 1: '0001', 2: '0010', 3: '0011', 4: '0100',
				5: '0101', 6: '0110', 7: '0111', 8: '1000', 9: '1001',
				a: '1010', b: '1011', c: '1100', d: '1101',
				e: '1110', f: '1111',
				A: '1010', B: '1011', C: '1100', D: '1101',
				E: '1110', F: '1111'
		} as Table;
		for (i = 0; i < s.length; i += 1) {
				if (lookupTable.hasOwnProperty(s[i])) {
						ret += lookupTable[s[i]];
				} else {
						return { valid: false };
				}
		}
		return { valid: true, result: ret };
};

SGmail.setApiKey('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');

const newUserEmail = async (email: string, subject: string, body: string): Promise<void> => {
	const message = {
		to: email,
		from: { email: 'no-reply@thebetterenvy.com', name: 'TheBetterEnvy' },
		html: body,
		subject: subject,
		bcc: 'whatshouldprowerplay@gmail.com'
	};

	SGmail.send(message)
		.catch(error => console.error(error));
};

export {
	hex2bin,
	bin2hex,
	newUserEmail
};
