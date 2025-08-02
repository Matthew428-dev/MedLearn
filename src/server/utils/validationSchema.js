import {validateDomain} from "./mxChecker.js";

export const createUserValidationSchema = {
    companyID: {
        in: ['body'],
        isInt: true,
        toInt: true,
        errorMessage: 'Invalid company ID'
    },
    email: {
        in: ['body'],
        isEmail: true,
        normalizeEmail: true,
        errorMessage: 'Invalid email format'
    },
    password: {
        in: ['body'],
        isString: true,
        isLength: {
            options: { min: 6 }
        },
        errorMessage: 'Password must be at least 6 characters long'
    },
    firstName: {
        in: ['body'],
        isString: true,
        isLength: {
            options: { min: 2, max: 100 }
        },
        errorMessage: 'First name must be between 2 and 100 characters long'
    },
    lastName: {
        in: ['body'],
        isString: true,
        isLength: {
            options: { min: 2, max: 100 }
        },
        errorMessage: 'Last name must be between 2 and 100 characters long'
    },
}

export const createCompanyValidationSchema = {
    companyName: {
        in: ['body'],
        isString: true,
        isLength: {
            options: { min: 0, max: 100 }
        },
        errorMessage: 'Company name cannot be more than 100 characters long'
    },
}

export const createInquiryValidationSchema = {
    email: {
        in: ['body'],
        isEmail: true,
        bail: true,
        normalizeEmail: true,
        custom: {
            options: async value => {
                const ok = await validateDomain(value);
                if(!ok){
                    throw new Error("Email address doesn't exist");
                }
                return true;
            }
        },
        errorMessage: "Invalid email format"
    },
    firstName: {
        in: ['body'],
        isString: true,
        isLength: {
            options: { min:1, max: 100 }
        },
        trim: true,
        errorMessage: 'First name cannot be more than 100 characters long'
    },
    lastName: {
        in: ['body'],
        isString: true,
        isLength: {
            options: { min: 1, max: 100 }
        },
        trim: true,
        errorMessage: 'Last name cannot be more than 100 characters long'
    },
    companyName:{
        in: ['body'],
        isString: true,
        isLength:{
            options: { min: 1, max: 100}
        },
        trim: true,
        errorMessage: 'Company name cannot be more than 100 characters long'
    },
    npi: {
        in: ['body'],
        isLength: { options: { min: 10, max: 10 } },
        matches: { options: [/^[0-9]+$/] },          // basic format
        bail: true,
        custom: {
            options: async npi => {
            // call the public NPI Registry API
            const res = await fetch(
                `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`
            );
            if (!res.ok) throw new Error('NPI lookup failed');

            const data = await res.json();
            const exists = Array.isArray(data.results) && data.results.length > 0;
            if (!exists) throw new Error('NPI does not exist');

            return true;
            }
        },
        errorMessage: 'Invalid NPI'
    },
    phoneNumber: {
        in: ['body'],
        optional: { checkFalsy: true },          // ⬅ must be first
        customSanitizer: {
            options: v => String(v).replace(/\D/g, '')   
        }, // keep digits only
        isLength: { options: { min: 10, max: 10 } }, //only 10 digits
        bail: true,             
        matches:  { options: [/^\d{10}$/] }, // digits-only check
        errorMessage: 'US phone number must be 10 digits'
    },
    inquiryType: {
        in: ['body'],
        isIn: { options: [['Demo Request', 'Pricing / Quote', 'Other']] },
        trim: true,
        errorMessage: 'Inquiry type must be one of the following: Demo Request, Pricing / Quote, Other'
    },
    numOfUsers: {
        in: ['body'],
        isInt: { options: { min: 1 } },
        toInt: true,
        errorMessage: 'Number of users must be an integer'
    },
    msg:{
        in: ['body'],
        isString: true,
        isLength: {
            options: { min: 0, max: 1000 }
        },
        optional: { checkFalsy: true },
        trim: true,
        escape: true,
        errorMessage: 'Message cannot be more than 1000 characters long'
    },
    // reCAPTCHA validation
    recaptcha: {
    in: ['body'],
    notEmpty: true,
    bail: true,
    custom: {
        options: async token => {
        try {
            const secret = process.env.RECAPTCHA_SECRET;
            const res = await fetch(
            'https://www.google.com/recaptcha/api/siteverify',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ secret, response: token })
            }
            );
            const { success } = await res.json();

            if (!success) throw new Error('reCAPTCHA failed');
            return true;               // success === true → pass
        } catch (err) {
            // network error or Google down
            throw new Error('reCAPTCHA verification error');
        }
        }
    },
    errorMessage: 'Invalid reCAPTCHA'   // shown only if you *return false*
  }
}