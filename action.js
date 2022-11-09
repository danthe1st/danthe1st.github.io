const setBGPosition = (elem, e) => {
    elem.style.backgroundPositionX = e.clientX + "px"
    elem.style.backgroundPositionY = e.clientY + "px"
}

const loadSpecificRepo = reponame => {
    if (!reponame.includes("/")) {
        reponame = "danthe1st/" + reponame
    }
	let repo=null;
	/*if(!localStorage.specificRepos){
		localStorage.specificRepos=[]
	}*/
	if(localStorage[reponame]){
		repo=Promise.resolve(localStorage[reponame])
	}else{
		repo=fetch("https://api.github.com/repos/" + reponame)
			.then(res => res.text())
			.then(r=>localStorage[reponame]=r)
	}
    return repo
			.then(txt=>JSON.parse(txt))
}

const loadRepos = () => {
	let repos=null;
	if(localStorage.repos){
		repos = Promise.resolve(localStorage.repos);
	}else{
		repos=fetch("https://api.github.com/users/danthe1st/repos?per_page=100")
			.then(res => res.text())
			.then(r=>localStorage.repos=r);
	}
    return repos
			.then(txt=>JSON.parse(txt))
}


const getHomepageString = repo => {
    if (repo.homepage) {
        return `<a href="${repo.homepage}" class="btn btn-secondary">Homepage</a>`
    }
    return ""
}

const buildRepo = repo => {
    if(!repo.name){
        return "";
    }
    return `
    <div class="repo-card card d-inline-flex h-100" >
      <div class="card-body">
        <div class="card-title">
            <h5>
                ${repo.name}
            </h5>
        </div>
        <p class="card-text repo-desc">${repo.description}</p>
        <a href="${repo.html_url}" class="btn btn-primary">Visit</a>
        ${getHomepageString(repo)}
        <div class="star-btn">
        <a class="github-button invisible-text" href="${repo.html_url}" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star danthe1st/${repo.name} on GitHub">Star</a>
      </div>
      </div>
    </div>
</div>
    `
}

const insertRepo = (elem, repo) => {
    elem.innerHTML += buildRepo(repo)
}

const buildRepos = repoDiv => {
    return loadRepos().then(repos=>{
        if(Symbol.iterator in Object(repos)) {
            for (const repo of repos) {
                if (!repo.fork && !repo.archived && !repo.disabled && repo.description) {
                    insertRepo(repoDiv, repo)
                }
            }
        }
    })

}

const prevElementVisibleIfHasContent=elem=>{
    if(elem.children.length===0){
        return false
    }
    elem.previousElementSibling.style.display="block"
    return true
}

const buildReposFeatured = featuredRepoDiv => {
    const promises = []
    for (const repoName of ["IJ2gDocs", "Eclipse2gDocs", "JDoc4droid", "compile-time-json-parser", "JDiscordBots/Mee6-bypasser"]) {
        promises.push(
            loadSpecificRepo(repoName)
                .then(repo => insertRepo(featuredRepoDiv, repo)))
    }
    return Promise.all(promises)
}

const loadExternalScript=url=>{
    const script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script)
}

window.onload = async () => {
    document.body.onmousemove = e => {
        setBGPosition(document.body, e)
    }
    const featuredRepoDiv = document.getElementById("repos-featured")
    let promises=[]
    if (featuredRepoDiv) {
        promises.push(buildReposFeatured(featuredRepoDiv))
    }
    const repoDiv = document.getElementById("repos")
    if (repoDiv) {
        promises.push(buildRepos(repoDiv))
    }
    Promise.all(promises).then(()=>{
        if(prevElementVisibleIfHasContent(featuredRepoDiv)|prevElementVisibleIfHasContent(repoDiv)){
            loadExternalScript("https://buttons.github.io/buttons.js")
        }
    })
    const markdownConverter = new showdown.Converter()
    fetch("https://raw.githubusercontent.com/danthe1st/danthe1st/master/README.md")
        .then(res=>res.text())
        .then(txt=>txt.substr(txt.indexOf("\n")))
        .then(txt=>markdownConverter.makeHtml(txt))
        .then(html=>document.getElementById("gh-readme").innerHTML=html)
}

