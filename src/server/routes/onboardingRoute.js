import { Router } from 'express'
import { checkSchema, validationResult, matchedData } from 'express-validator';
import { addAvatarValidationSchema} from '../utils/validationSchema.js';
import { hashToken} from '../utils/hashToken.js';
import {getOnboardingInfoFromTokenHash} from '../daos/invitesDao.js'

const router = Router();

router.get('/api/public/onboarding.html', async (req,res) => {
    
    //get the token from the url, i think req.query gets everything after the ?, but not sure
    const token = String(req.query.token || '');

    //hash the token so we can find it in the db, which is hashed because if someone
    //gets control of the db, they won't have access to the actual tokens
    const tokenHash = hashToken(token);
    
    //has to be declared outside of the try catch so it can be returned at the end
    let info;
    try{
        //get the invite
        info = await getOnboardingInfoFromTokenHash(tokenHash);
        
        //if no invite exists
        if(info.length === 0){
            return res.status(404).json({message: "Invite not found"});
        }
        
    }
    catch(errors){
        return res.status(500).json({ errors: errors.array() });
    }
    
    //info contains role, npi, companyName, and email, we have to return info so
    //this information can be utilized by the front end
    return res.status(200).json(info);
});

export default router;