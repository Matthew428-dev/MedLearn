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
        errorMessage: 'Company name cannot be more than 10 characters long'
    },
    npi: {
        in: ['body'],
        isString: true,
        isLength: {
            options: { min: 10, max: 10 }
        },
        matches: { options: [/^\d{10}$/] },
        //custom: { options: isValidNpi },    
        errorMessage: 'Invalid NPI'
    },
    phoneNumber: {
        in: ['body'],
        optional: { checkFalsy: true },          // ⬅ must be first
        customSanitizer: {
            options: v => String(v).replace(/\D/g, '')   
        }, // keep digits only
        isLength: { options: { min: 10, max: 10 } },             // exactly 10 digits
        matches:  { options: [/^\d{10}$/] },                     // digits-only check
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
    }
}