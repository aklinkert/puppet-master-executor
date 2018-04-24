export const name = "instagram";

export const urls = {
    login: "https://www.instagram.com/accounts/login/",
    timeline: "https://www.instagram.com/",
    explore: "https://www.instagram.com/explore/people/",
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
        likeableItem: "section main section article section a .coreSpriteHeartOpen",
        likeButton: "section a .coreSpriteHeartOpen",
        user: "header div:nth-child(2) a"
    },
    general: {
        footer: "section footer",
    },
    page: {
        followButton: "section main article header section button:nth-child(1)",
    },
};

