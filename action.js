const setBGPosition = (elem, e) => {
    elem.style.backgroundPositionX = e.clientX + "px"
    elem.style.backgroundPositionY = e.clientY + "px"
}

const loadSpecificRepo = reponame => {
    if (!reponame.includes("/")) {
        reponame = "danthe1st/" + reponame
    }
    return fetch("https://api.github.com/repos/" + reponame)
        .then(res => res.json())
}

const loadRepos = () => {
    return fetch("https://api.github.com/users/danthe1st/repos?per_page=100")
        .then(res => res.json())
}


const getHomepageString = repo => {
    if (repo.homepage) {
        return `<a href="${repo.homepage}" class="btn btn-secondary">Homepage</a>`
    }
    return ""
}

const buildRepo = repo => {
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
        for (const repo of repos) {
            if (!repo.fork && !repo.archived && !repo.disabled && repo.description) {
                insertRepo(repoDiv, repo)
            }
        }
    })

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
    const promises=[]
    if (featuredRepoDiv) {
        promises.push(buildReposFeatured(featuredRepoDiv))
    }
    const repoDiv = document.getElementById("repos")
    if (repoDiv) {
        promises.push(buildRepos(repoDiv))
    }
    Promise.all(promises).then(()=>loadExternalScript("https://buttons.github.io/buttons.js"))
}

