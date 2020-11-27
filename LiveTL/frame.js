const languages = [
    { code: "en", name: "English", lang: "English" },
    { code: "jp", name: "Japanese", lang: "日本語" },
    { code: "ch", name: "Chinese", lang: "中文" },
    { code: "id", name: "Indonesian", lang: "bahasa Indonesia" },
    { code: "es", name: "Spanish", lang: "Español" },
];


let languageConversionTable = {};
languages.forEach(i => languageConversionTable[i.name + ` [${i.code}]`] = i);

languages.sort((a, b) => a.code - b.code);


// global helper function to handle scrolling
function updateSize() {
    let pix = document.querySelector(".dropdown-check-list").getBoundingClientRect().bottom;
    document.querySelector(".modal").style.height = pix + "px";
}

function runLiveTL() {
    document.head.innerHTML += `
        <head>
            <link rel="icon" href="https://kentonishi.github.io/LiveTL/favicon.ico" type="image/x-icon" />
        </head>
    `;
    switchChat();
    setTimeout(() => {
        document.title = "LiveTL Chat";
        let style = document.createElement('style');
        style.innerHTML = `
            .livetl {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: var(--yt-live-chat-background-color);
                color: var(--yt-live-chat-primary-text-color);
                z-index: 0;
                word-wrap: break-word;
                word-break: break-word;
                font-size: 20px;
                overflow-x: none;
                overflow-y: auto;
                padding: 0px;
                min-height: 0px !important;
                min-width 0px !important;
            }

            a {
                color: var(--yt-live-chat-primary-text-color);
                text-decoration:none;
            }

            /* width */
            ::-webkit-scrollbar {
              width: 4px;
            }
            
            /* Track */
            ::-webkit-scrollbar-track {
              background: #f1f1f1; 
            }
             
            /* Handle */
            ::-webkit-scrollbar-thumb {
              background: #888; 
            }
            
            /* Handle on hover */
            ::-webkit-scrollbar-thumb:hover {
              background: #555; 
            }

            .livetl * {
                vertical-align: baseline;
            }
            .navbar{
                margin-top: 10px;
                min-height: 25px;
            }
            input {
                padding: 5px;
            }
            .dropdown-check-list {
                display: inline-block;
                background-color: white;
                color: black;
                font-size: 14px;
            }
            .dropdown-check-list .anchor {
                position: relative;
                cursor: pointer;
                display: inline-block;
                padding: 5px 50px 5px 10px;
                border: 1px solid #ccc;
            }
            .dropdown-check-list .anchor:after {
                position: absolute;
                content: "";
                border-left: 2px solid black;
                border-top: 2px solid black;
                padding: 5px;
                right: 10px;
                top: 20%;
                -moz-transform: rotate(-135deg);
                -ms-transform: rotate(-135deg);
                -o-transform: rotate(-135deg);
                -webkit-transform: rotate(-135deg);
                transform: rotate(-135deg);
            }
            .dropdown-check-list .anchor:active:after {
                right: 8px;
                top: 21%;
            }
            .dropdown-check-list ul.items {
                padding: 2px;
                display: none;
                margin: 0;
                border: 1px solid #ccc;
                border-top: none;
            }
            .dropdown-check-list ul.items li {
                list-style: none;
            }

            .dropdown-check-list {
                position: absolute;
            }

            .translationText {
                position: absolute;
                z-index: -1;
                margin-top: 5px;
                margin-botton: 5px;
                width: calc(100% - 10px);
            }

            .authorName {
                font-size: 12px;
                color: #bdbdbd;
                margin-left: 5px;
                vertical-align: baseline;
            }

            label {
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: -moz-none;
                -o-user-select: none;
                user-select: none;
            }

            .hide {
                stroke-width: 0;
                fill: #A0A0A0;
                stroke: rgb(0, 153, 255);
                width: 12px;
                height: 12px;
            }

            .hide:hover {
                fill: cornflowerblue;
            }

            .ban {
                stroke-width: 0;
                fill: #A0A0A0;
                stroke: rgb(0, 153, 255);
                width: 12px;
                height: 12px;
            }

            .ban:hover {
                fill: crimson;
            }

            .optionLabel {
                position: absolute;
                margin-left: 0;
                display: contents !important;
            }

            .line {
                margin-left: 15px;
                margin-top: 10px;
                margin-bottom: 10px;
            }

            .messageOptions {
                margin-left: 5px;
            }

            .logo {
                width: 20px;
                height: 20px;
                vertical-align: top;
                margin-top: 1px;
                margin-right: 5px;
            }
        ` + modalCSS;

        document.head.innerHTML += `
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fork-awesome@1.1.7/css/fork-awesome.min.css" integrity="sha256-gsmEoJAws/Kd3CjuOQzLie5Q3yshhvmo7YNtBG7aaEY=" crossorigin="anonymous">
        `;

        document.getElementsByTagName("head")[0].appendChild(style);
        let livetlContainer = document.createElement("div");
        livetlContainer.className = "livetl";
        document.body.appendChild(livetlContainer);
        if (params.devMode) {
            livetlContainer.style.display = "none";
        }
        let settings = createModal(livetlContainer);
        let e = document.createElement("div");
        e.className = "translationText";
        let select = document.createElement("input");
        select.dataset.role = "none";
        let datalist = document.createElement("datalist");
        datalist.id = "languages";
        languages.forEach(lang => {
            let opt = document.createElement("option");
            opt.value = `${lang.name} [${lang.code}]`;
            if (lang.code == "en") select.value = opt.value;
            datalist.appendChild(opt);
        });
        let lastLang = select.value;
        select.id = "langSelect";
        select.setAttribute("list", datalist.id);
        select.onblur = () => {
            if (!(select.value in languageConversionTable)) {
                select.value = lastLang;
            }
        }
        select.onfocus = () => select.value = "";

        let checklist = document.createElement("div");
        checklist.className = "dropdown-check-list";
        checklist.tabIndex = 1;
        let defaultText = document.createElement("span");
        defaultText.className = "anchor";
        defaultText.textContent = "View All";
        checklist.appendChild(defaultText);
        let items = document.createElement("ul");
        items.id = "items";
        items.className = "items";
        checklist.appendChild(items);

        let langSelectLabel = document.createElement("span");
        langSelectLabel.className = "optionLabel";
        langSelectLabel.textContent = "Language: ";
        let langSelectContainer = document.createElement("div");
        langSelectContainer.appendChild(langSelectLabel);
        langSelectContainer.appendChild(select);
        langSelectContainer.appendChild(datalist);
        settings.appendChild(langSelectContainer);
        // settings.appendChild(document.createElement("br"));
        let translatorSelectLabel = document.createElement("span");
        translatorSelectLabel.className = "optionLabel";
        translatorSelectLabel.innerHTML = "Translators:&nbsp";
        let translatorSelectContainer = document.createElement("div");
        translatorSelectContainer.appendChild(translatorSelectLabel);
        translatorSelectContainer.appendChild(checklist);
        settings.appendChild(translatorSelectContainer);
        livetlContainer.appendChild(e);

        // let allTranslatorsStr = localStorage.getItem("allTranslators") || "{}";

        let allTranslators = "{}"; // JSON.parse(allTranslatorsStr);

        let allTranslatorCheckbox = {};

        checkboxUpdate = () => {
            allTranslators = {};
            let boxes = checklist.querySelectorAll("input");
            boxes.forEach(box => {
                allTranslators[box.dataset.id] = box;
                if (box != allTranslatorCheckbox && !box.checked) allTranslatorCheckbox.checked = false;
            });
            if (allTranslatorCheckbox.checked) {
                let boxes = checklist.querySelectorAll("input:not(:checked)");
                boxes.forEach(box => box.checked = true)
            }
            let messages = document.querySelectorAll(".line");
            for (i = 0; i < messages.length; i++) {
                if (i > 25) {
                    messages[i].remove();
                    continue;
                }
                if (!messages[i].querySelector(".authorName")) continue;
                if (!allTranslators[messages[i].querySelector(".authorName").dataset.id].checked) {
                    messages[i].remove();
                }
            }
            // localStorage.setItem("allTranslators", JSON.stringify(allTranslators));
        }

        createCheckbox = (name, authorID, checked = false, callback = null) => {
            let selectTranslatorMessage = document.createElement("li");
            items.append(selectTranslatorMessage);
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.dataset.id = authorID;
            checkbox.checked = checked;
            checkbox.onchange = callback || checkboxUpdate;
            selectTranslatorMessage.appendChild(checkbox);
            let person = document.createElement("label");
            person.setAttribute("for", authorID);
            person.textContent = name;
            selectTranslatorMessage.appendChild(person);
            checkboxUpdate();
            return checkbox;
        }

        allTranslatorCheckbox = createCheckbox("All Translators", "allTranslatorID", true, () => {
            let boxes = checklist.querySelectorAll("input:not(:checked)");
            boxes.forEach(box => box.checked = allTranslatorCheckbox.checked);
            checkboxUpdate();
        });

        checklist.getElementsByClassName('anchor')[0].onclick = () => {
            if (items.style.display != "block") items.style.display = "block";
            else items.style.display = "none";
            updateSize();
        }

        checklist.onblur = e => {
            if (!e.currentTarget.contains(e.relatedTarget)) items.style.display = "none";
            else e.currentTarget.focus();
            updateSize();
        }

        prependE = (el) => {
            e.prepend(el);
        }

        getProfilePic = (el) => {
            try {
                let parent = el;
                while (!parent.querySelector("img")) {
                    parent = parent.parentElement;
                }
                return parent.querySelector("img").src;
            } catch (e) { };
        }

        // let checkedSet = new Set();

        let welcome = document.createElement("div");
        welcome.className = "line";
        let logo = document.createElement("img");
        logo.className = "logo";
        logo.src = "https://kentonishi.github.io/LiveTL/favicon.ico";
        let logosize = "20px";
        // logo.style.width = logosize;
        // logo.style.height = logosize;
        welcome.appendChild(logo);
        let discordIcon = document.createElement("i");
        ["fa", "fa-discord"].forEach(c => discordIcon.classList.add(c));
        let githubIcon = document.createElement("i");
        ["fa", "fa-github"].forEach(c => githubIcon.classList.add(c));
        let welcomeText = document.createElement("span");
        welcomeText.textContent = " Welcome to LiveTL! Translations will appear above.";
        let di = document.createElement("a");
        let gi = document.createElement("a");
        di.appendChild(discordIcon);
        gi.appendChild(githubIcon);
        // di.innerHTML = "&nbsp" + di.innerHTML;
        gi.innerHTML = "&nbsp" + gi.innerHTML;
        di.href = "https://discord.gg/uJrV3tmthg";
        gi.href = "https://github.com/KentoNishi/LiveTL";
        di.target = gi.target = "about:blank";
        welcome.appendChild(di);
        welcome.appendChild(gi);
        welcome.appendChild(welcomeText);
        prependE(welcome);


        setInterval(() => {
            // if (select.value in languageConversionTable && select.value != lastLang) e.innerHTML = "";
            let start = (new Date()).getMilliseconds();
            let messages = document.querySelectorAll(".yt-live-chat-text-message-renderer > #message");
            for (let i = messages.length - 1; i >= 0; i--) {
                // if (!checkedSet.has(m.textContent)) {
                //     // console.log(`Scanning message: ${m.textContent}`);
                //     checkedSet.add(m.textContent);
                // }
                let m = messages[i];
                if (m.innerHTML == "") break;
                let parsed = /^\[(\w+)\] ?(.+)/.exec(m.textContent);
                if (parsed != null && parsed[1].toLowerCase() == languageConversionTable[select.value].code) {
                    console.log(getProfilePic(m));
                    let author = m.parentElement.childNodes[1].textContent;
                    let authorID = getProfilePic(m);
                    let line = document.createElement("div");
                    line.className = "line";
                    line.textContent = parsed[2];
                    let authorInfo = document.createElement("span");
                    let authorName = document.createElement("span");
                    authorName.className = "authorName";
                    line.appendChild(authorInfo);
                    authorName.textContent = author;
                    authorName.dataset.id = authorID;
                    authorInfo.appendChild(authorName);
                    let hide = document.createElement("span");
                    hide.style.cursor = "pointer";
                    hide.onclick = () => line.remove();
                    hide.innerHTML = `
                    <svg class="hide" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                        viewBox="0 0 572.098 572.098" style="enable-background:new 0 0 572.098 572.098;"
                        xml:space="preserve">
                        <g>
                            <path d="M99.187,398.999l44.333-44.332c-24.89-15.037-47.503-33.984-66.763-56.379c29.187-33.941,66.053-60.018,106.947-76.426
                                c-6.279,14.002-9.853,29.486-9.853,45.827c0,16.597,3.696,32.3,10.165,46.476l35.802-35.797
                                c-5.698-5.594-9.248-13.36-9.248-21.977c0-17.02,13.801-30.82,30.82-30.82c8.611,0,16.383,3.55,21.971,9.248l32.534-32.534
                                l36.635-36.628l18.366-18.373c-21.206-4.186-42.896-6.469-64.848-6.469c-107.663,0-209.732,52.155-273.038,139.518L0,298.288
                                l13.011,17.957C36.83,349.116,66.151,376.999,99.187,398.999z"/>
                            <path d="M459.208,188.998l-44.854,44.854c30.539,16.071,58.115,37.846,80.986,64.437
                                c-52.167,60.662-128.826,96.273-209.292,96.273c-10.3,0-20.533-0.6-30.661-1.744l-52.375,52.375
                                c26.903,6.887,54.762,10.57,83.036,10.57c107.663,0,209.738-52.154,273.038-139.523l13.011-17.957l-13.011-17.956
                                C532.023,242.995,497.844,212.15,459.208,188.998z"/>
                            <path d="M286.049,379.888c61.965,0,112.198-50.234,112.198-112.199c0-5.588-0.545-11.035-1.335-16.402L269.647,378.56
                                C275.015,379.349,280.461,379.888,286.049,379.888z"/>
                            <path d="M248.815,373.431L391.79,230.455l4.994-4.994l45.796-45.796l86.764-86.77c13.543-13.543,13.543-35.502,0-49.046
                                c-6.77-6.769-15.649-10.159-24.523-10.159s-17.754,3.384-24.522,10.159l-108.33,108.336l-22.772,22.772l-29.248,29.248
                                l-48.14,48.14l-34.456,34.456l-44.027,44.027l-33.115,33.115l-45.056,45.055l-70.208,70.203
                                c-13.543,13.543-13.543,35.502,0,49.045c6.769,6.77,15.649,10.16,24.523,10.16s17.754-3.385,24.523-10.16l88.899-88.898
                                l50.086-50.086L248.815,373.431z"/>
                        </g>
                    </svg>
                    `;
                    let ban = document.createElement("span");
                    ban.onclick = () => {
                        allTranslators[authorID].checked = false;
                        checkboxUpdate();
                    }
                    ban.style.cursor = "pointer";
                    ban.innerHTML = `
                    <svg class="ban" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <g data-name="Layer 2">
                            <g data-name="person-delete">
                                <rect width="24" height="24" opacity="0" />
                                <path
                                    d="M20.47 7.5l.73-.73a1 1 0 0 0-1.47-1.47L19 6l-.73-.73a1 1 0 0 0-1.47 1.5l.73.73-.73.73a1 1 0 0 0 1.47 1.47L19 9l.73.73a1 1 0 0 0 1.47-1.5z" />
                                <path d="M10 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
                                <path d="M16 21a1 1 0 0 0 1-1 7 7 0 0 0-14 0 1 1 0 0 0 1 1z" />
                            </g>
                        </g>
                    </svg>
                    `;
                    let options = document.createElement("span");
                    options.appendChild(hide);
                    options.appendChild(ban);
                    authorInfo.append(options);
                    if (!(authorID in allTranslators)) createCheckbox(author, authorID, allTranslatorCheckbox.checked);
                    if (allTranslators[authorID].checked) prependE(line);
                    options.style.display = "none";
                    options.className = "messageOptions";
                    line.onmouseover = () => options.style.display = "inline-block";
                    line.onmouseleave = () => options.style.display = "none";
                }
                // m.classList.add("scanned");
                // m.textContent = "[SCANNED] " + m.textContent;
                m.innerHTML = "";
            }
            let settingsProjection = document.querySelector("#settingsProjection");
            if (settingsProjection) settingsProjection.remove();
            settingsProjection = document.createElement("div");
            settingsProjection.id = "settingsProjection";
            settingsProjection.style.zIndex = -1;
            prependE(settingsProjection);
            // messages.forEach(m => {
            //     m.classList.add("scanned");
            //     let t = document.createElement("span");
            //     t.textContent = "[SCANNED] ";
            //     m.prepend(t);
            // })
            // if (select.value in languageConversionTable) lastLang = select.value;
            // console.log(`Scanning took ${(new Date()).getMilliseconds() - start}ms`);
            // e.scrollTop = e.scrollHeight;
        }, 1000);
    }, 100);
}

function switchChat() {
    let count = 2;
    document.querySelectorAll(".yt-dropdown-menu").forEach((e) => {
        if (/Live chat/.exec(e.innerText) && count > 0) {
            e.click();
            count--;
        }
    })
};

function parseParams() {
    let s = decodeURI(location.search.substring(1))
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"');
    return s == "" ? {} : JSON.parse('{"' + s + '"}');
}

function insertLiveTLButtons(isHolotools) {
    console.log("Inserting LiveTL Launcher Buttons");
    params = parseParams();
    makeButton = (text, callback, color) => {
        let a = document.createElement("span");
        a.innerHTML = `
        <a class="yt-simple-endpoint style-scope ytd-toggle-button-renderer" tabindex="-1" style="
            background-color: ${color || "rgb(0, 153, 255)"};
            font: inherit;
            font-size: 11px;
            font-weight: bold;
            width: 100%;
            margin: 0;
            ">
            <paper-button id="button" class="style-scope ytd-toggle-button-renderer" role="button" tabindex="0" animated=""
                elevation="0" aria-disabled="false" style="
            padding: 5px;
        ">
                <yt-formatted-string id="text" class="style-scope ytd-toggle-button-renderer">
                </yt-formatted-string>
                <paper-ripple class="style-scope paper-button">
                    <div id="background" class="style-scope paper-ripple" style="opacity: 0.00738;"></div>
                    <div id="waves" class="style-scope paper-ripple"></div>
                </paper-ripple>
                <paper-ripple class="style-scope paper-button">
                    <div id="background" class="style-scope paper-ripple" style="opacity: 0.007456;"></div>
                    <div id="waves" class="style-scope paper-ripple"></div>
                </paper-ripple>
                <paper-ripple class="style-scope paper-button">
                    <div id="background" class="style-scope paper-ripple" style="opacity: 0.007748;"></div>
                    <div id="waves" class="style-scope paper-ripple"></div>
                </paper-ripple>
            </paper-button>
        </a>
    `;
        let interval2 = setInterval(() => {
            let e = document.querySelector("ytd-live-chat-frame") || document.querySelector("#input-panel");
            if (e != null) {
                clearInterval(interval2);
                if (isHolotools) {
                    e.style.textAlign = "center";
                    e.appendChild(a);
                } else {
                    e.appendChild(a);
                }
                a.querySelector("a").onclick = callback;
                a.querySelector("yt-formatted-string").textContent = text;
            }
        }, 100);
    }
    makeButton("Watch in LiveTL", () => window.location.href = "https://kentonishi.github.io/LiveTL/?v=" + params.v);
    makeButton("Pop Out Translations", () => window.open(`https://www.youtube.com/live_chat?v=${params.v}&useLiveTL=1`, "",
        "scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=600,height=300"
    ), "rgb(143, 143, 143)");
}

let params = {};
let activationInterval = setInterval(() => {
    // console.log("Checking if LiveTL needs to be activated");
    if (window.location.href.startsWith("https://www.youtube.com/live_chat")) {
        clearInterval(activationInterval);
        console.log("Using live chat");
        try {
            params = parseParams();
            if (params.useLiveTL) {
                console.log("Running LiveTL!");
                runLiveTL();
            } else if (params.embed_domain == "hololive.jetri.co") {
                insertLiveTLButtons(true);
            }
        } catch (e) { }
    } else if (window.location.href.startsWith("https://www.youtube.com/watch")) {
        clearInterval(activationInterval);
        console.log("Watching video");
        let interval = setInterval(() => {
            if (document.querySelector(".view-count") && document.querySelector(".view-count").textContent.endsWith("now")) {
                clearInterval(interval);
                insertLiveTLButtons();
            }
        }, 100);
    } else {
        // console.log(`${window.location.href} does not need LiveTL`);
    }
}, 1000);

function createModal(container) {
    let settingsButton = document.createElement("div");
    settingsButton.innerHTML = settingsGear;
    settingsButton.id = "settingsGear";
    settingsButton.style.zIndex = 1000000;
    settingsButton.style.padding = "5px";
    settingsButton.style.width = "24px";

    let modalContainer = document.createElement("div");
    modalContainer.className = "modal";
    modalContainer.style.zIndex = 1000000;
    modalContainer.style.width = "calc(100% - 20px);";
    modalContainer.style.display = "none";

    let modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    let nextStyle = {
        "flex": "none",
        "none": "flex",
    };

    let icon = {
        "flex": closeSVG,
        "none": settingsGear,
    };


    settingsButton.addEventListener("click", (e) => {
        let newDisplay = nextStyle[modalContainer.style.display];
        modalContainer.style.display = newDisplay;
        settingsButton.innerHTML = icon[newDisplay];
        if (newDisplay == "none") {
            document.querySelector(".translationText").style.display = "block";
            modalContainer.style.height = "auto";
        } else {
            document.querySelector(".translationText").style.display = "none";
            updateSize();
        }
    });

    modalContainer.appendChild(modalContent);

    container.appendChild(settingsButton);
    container.appendChild(modalContainer);

    return modalContent;
}

const modalCSS = `

svg {
    stroke: #A0A0A0;
    fill: #A0A0A0;
};


 /* The Modal (background) */
.modal .modal-content {
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    top: 0;
    left: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: var(--yt-live-chat-background-color);
    color: var(--yt-live-chat-primary-text-color);
}

/* Modal Content/Box */


.modal-content>* {
    margin-left: 10px;
}

.modal-content>*:not(.dropdown-check-list) {
    margin: 10px;
}

.modal-content {
    justify-content: center;
}

.modal {
    justify-content: center;
    padding-top: 30px;
    padding-left: 10px;
}

#settingsGear {
    top: 10px !important;
    stroke: #0099FF1;
    cursor: pointer;
    position: fixed;
    right: 5px;
    z-index: 1000000;
}

#settingsProjection {
    margin-top: 10px;
    width: 25px;
    height: 25px;
    float: right;
};
`;

const closeSVG = `
<svg class="svgButton" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`;

const settingsGear = `<svg class="svgButton" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>`;

