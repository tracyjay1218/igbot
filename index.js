"use strict";

require("dotenv").config();
const puppeteer = require("puppeteer");
const Instauto = require("instauto");

const options = {
    cookiesPath:"./database/cookies.json",

    username: process.env.INSTA_USERNAME,
    password: process.env.INSTA_PASSWORD,

    //Set restrictions so we don't get blocked by IG

    maxFollowsPerHour: 20,
    maxFollowsPerDay: 150,
    maxLikesPerDay: 200,

    followUserRatioMin: 0.8,
    followUserRatioMax: 5.0,

    dontUnfollowUntilTimeElapsed: 3 * 24 * 60 * 60 * 1000,
    excludeUsers: [],

    dryRun: false,
};

(async () => {
    
    let browser;

    try{
        browser = await puppeteer.launch({
            headless: false,
        ignoreHTTPSErrors: true});


//Creating the JSON Database.
        const instautoDb = await Instauto.JSONDB({
            followedDbPath: "./database/followed.json",
            unfollowedDbPath: "./database/unfollowed.json",
            likedPhotosDbPath: "./database/liked-photos.json",
        });

        const instauto = await Instauto(instautoDb, browser, options);

        const unfollowedCount = await instauto.unfollowOldFollowed({
            ageInDays: 3,
            limit: options.maxFollowsPerDay * (2/3)
        });

        if(unfollowedCount > 0) await instauto.sleep(10 * 60 * 1000);

        const  usersToFollowFollowersOf = ["instaxpitbulls", "parkland_bullies", "southcoast_xlbullys","planet_bullies"];

        await instauto.followUsersFollowers({
            usersToFollowFollowersOf,
            maxFollowsTotal: options.maxFollowsPerDay - unfollowedCount,
            skipPrivate: true,
            enableLikeImages: true,
            likeImagesMax: 3,
            
        });
    await instauto.sleep(10 * 60 * 1000);

    console.log("Done Running.");

    await instauto.sleep(30000);
    } catch(err){
        console.log(err);
    } finally {
        console.log("Closing Browser");
        if(browser) await browser.close();
    }

})();