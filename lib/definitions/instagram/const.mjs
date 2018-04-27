export const name = "instagram";

export const urls = {
    login: "https://www.instagram.com/accounts/login/",
    timeline: "https://www.instagram.com/",
    explore: "https://www.instagram.com/explore/people/",
    activity: "https://www.instagram.com/accounts/activity/",
    user: "https://www.instagram.com/%s/"
};

export const selectors = {
    login: {
        username: "form input[name=username]",
        password: "form input[name=password]",
        submit: "form button",
        timeline: "section main section article",
        errors: "form p[role=alert]"
    },
    timeline: {
        item: "section main section article",
        likeButton: "section a .coreSpriteHeartOpen",
        user: "header div:nth-child(2) a",

        appDialogClose: "body > div > div[role=dialog] > button",
    },
    general: {
        footer: "section footer",
    },
    page: {
        followButton: "section main article header section button:nth-child(1)",
    },
    discoverPeople: {
        item: "body section main div ul div li",
        followButton: "span button",
        user: "a.notranslate",
    },
    activity: {
        item: "main[role=main] section ul li",
        followButton: "span button",
        user: "a.notranslate",
    },
};

export const chances = {
    followDiscoverUser: 0.5,
};
