let getSource = document.getElementById('getSource');
var window_location_pathname;
var video_src;
var turkish_srt_link;
var english_srt_link;
var lessons;

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getVideoSource") {
        //this.pageSource = request.source;
        //var title = this.pageSource.match(/<title[^>]*>([^<]+)<\/title>/)[1];
        video_src = request.source;
    }
    if (request.action == "getTurkishSRTSource") {
        //this.pageSource = request.source;
        //var title = this.pageSource.match(/<title[^>]*>([^<]+)<\/title>/)[1];
        turkish_srt_link = request.source;
    }
    if (request.action == "getEnglishSRTSource") {
        //this.pageSource = request.source;
        //var title = this.pageSource.match(/<title[^>]*>([^<]+)<\/title>/)[1];
        english_srt_link = request.source;
    }
    if (request.action == "getWindowLocationPathName") {
        //this.pageSource = request.source;
        //var title = this.pageSource.match(/<title[^>]*>([^<]+)<\/title>/)[1];
        window_location_pathname = request.source;
    }
    if (request.action == "getLessons") {
        //this.pageSource = request.source;
        //var title = this.pageSource.match(/<title[^>]*>([^<]+)<\/title>/)[1];
        lessons = request.source;

        var s_lessons = lessons.split("\n");
        var ul = document.getElementById("mylist");

        for(var i=0; i<s_lessons.length-1; ++i){
            var li = document.createElement("li");
            li.innerText = s_lessons[i];
            ul.appendChild(li);
        }
    }
    
});

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    //Video Source
    chrome.tabs.executeScript(
        tabs[0].id,
        { code: 'var s = document.getElementsByTagName("video")[0].src; chrome.runtime.sendMessage({action: "getVideoSource", source: s});' }
    );
    //Turkish
    chrome.tabs.executeScript(
        tabs[0].id,
        { code: 'var s = document.querySelector("track[label=Turkish]").src; chrome.runtime.sendMessage({action: "getTurkishSRTSource", source: s});' }
    );
    //English
    chrome.tabs.executeScript(
        tabs[0].id,
        { code: 'var s = document.querySelector("track[label=English]").src; chrome.runtime.sendMessage({action: "getEnglishSRTSource", source: s});' }
    );
    //URL
    chrome.tabs.executeScript(
        tabs[0].id,
        { code: 'var s = window.location.pathname; chrome.runtime.sendMessage({action: "getWindowLocationPathName", source: s});' }
    );
    //Get All Lessons
    var code_lessons = `
    var total = "";
    var counter = 0;
    var lesson_names = document.getElementsByClassName("rc-NavItemName caption-text");
    for(var i=0; i<lesson_names.length;++i){
        var lesson_name = lesson_names[i].innerText.split("\\n")[2];
        if(lesson_name){
            ++counter;
            total += (counter).toString().padStart(2, "0") + "#" +lesson_name.replaceAll(" ", "-").replaceAll("/","").replaceAll("?","").replaceAll("(","").replaceAll(")","").replaceAll("--","-").toLowerCase() + "\\n";
        }
        console.log("test" + lesson_name);
    }`
    chrome.tabs.executeScript(
        tabs[0].id,
        { code: code_lessons + 'chrome.runtime.sendMessage({action: "getLessons", source: total});' }
    ); 

    let clear_code = `
    var document_list = document.getElementsByClassName("rc-PreviousAndNextItem horizontal-box")[0];
    while(document_list.childElementCount > 3){
        document_list.children[3].remove();
    }`;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(
            tabs[0].id,
            {code: clear_code});    
    });
    
}); 

getSource.onclick = function(element) {

    var sources = [video_src, english_srt_link, turkish_srt_link];
    var p_location = window_location_pathname.split("/");
    var p_folder = p_location[p_location.length-1];

    var labels = ["VideoSRC", "EnglishSRT", "TurkishSRT"];
    var formats = [".mp4", ".vtt", ".vtt"]


    for(var i=0; i<sources.length; ++i){
        var li = document.createElement("li");
        a = document.createElement("a")
        a.setAttribute('href', sources[i]);
        a.setAttribute('download', p_folder + '_' + labels[i] + formats[i]);
        a.text = labels[i];
        /*
        if(a.text.includes("Video")){
            a.click();
        }
        */
        li.appendChild(a);
        
        let mycode = `
            var document_list = document.getElementsByClassName("rc-PreviousAndNextItem horizontal-box")[0];
            var li = document.createElement("li");
            li.innerHTML = '${li.innerHTML}';
            li.setAttribute("class", "nav-link dim body-1-text");
            document_list.appendChild(li);
            if(li.innerHTML.includes("SRT")){
                //li.firstElementChild.click();
            }
            console.log(li);
        `;

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.executeScript(
                tabs[0].id,
                {code: mycode});    
        });
    }
};

