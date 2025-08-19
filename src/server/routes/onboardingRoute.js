import { Router } from 'express'
import { checkSchema, validationResult, matchedData } from 'express-validator';
import { addAvatarValidationSchema, createUserValidationSchema, createCompanyValidationSchema} from '../utils/validationSchema.js';
import { hashToken} from '../utils/hashToken.js';
import {createCompany} from '../daos/companiesDao.js'
import { createUser,getUserByID} from '../daos/usersDao.js';

import {getOnboardingInfoFromTokenHash,markInviteUsed,getUnusedInviteByTokenHash} from '../daos/invitesDao.js'

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
        if(!info){
            return res.status(404).json({message: "Invalid invite link"});
        }
        
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
    
    //info contains role, npi, companyName, and email, we have to return info so
    //this information can be utilized by the front end
    return res.status(200).json(info);
});

router.post('/api/onboarding',checkSchema(createUserValidationSchema), checkSchema(createCompanyValidationSchema), async (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }
    //companyName, npi, email, password, firstName, lastName, token, 
    const {companyName, npi, email, password, firstName, lastName} = matchedData(req)
    //token is sent from onboarding.js
    const plainToken = req.body.token;

    //token is hashed so we can compare it to the value in the db
    const tokenHash = hashToken(plainToken);
    
    
        try{
            const invite = await getUnusedInviteByTokenHash(tokenHash);
            
            if(!invite){
                return res.status(401).json({message: "This link is no longer valid."});
            }

            //create a company
            const company = await createCompany(companyName,npi);

            //this if statement might not be necessary
            if(company.affectedRows === 0){
                return res.status(500).json({message: "Server error"});
            }

            //use the id from the company that was created to create the user
            const user = await createUser(company.insertId, email, password,firstName,lastName, invite.role)

            //the create user function only returns the okpacket from mysql, to get the 
            //other user info we have to use a separate function
            const userInfo = await getUserByID(user.insertId);
            if(!userInfo){
                return res.status(500).json({message: 'Unable to create user'});
            }

            const foo = await markInviteUsed(tokenHash);
            if(foo.affectedRows === 0){
                return res.status(500).json({message: "Unable to mark invite used"});
            }
            
            //to prevent fixation (some sort of malicious attack)
            await new Promise((resolve, reject) => {
                req.session.regenerate(err => err ? reject(err) : resolve());
            });

            //automatically login the user after the complete onboarding
            req.session.user = {
                userId:    user.insertId,
                email:     userInfo.email,
                companyId: userInfo.companyID,
                role:      userInfo.role,
                firstLogin: userInfo.firstLogin,
                firstName: userInfo.firstName,
                lastName: userInfo.lastName
            };

            await new Promise((resolve, reject) => {
                req.session.save(err => err ? reject(err) : resolve());
            });

            return res.status(201).json({message: "Onboarding Successful!"});
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
        }
        
});

export default router;