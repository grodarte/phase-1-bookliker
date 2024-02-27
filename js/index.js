const myUserID = 1
let myUserName
let myUserObj

document.addEventListener("DOMContentLoaded",() => {
    getMyUserName()
    getAllBookTitles()

})

function getMyUserName(){
   fetch (`http://localhost:3000/users/${myUserID}`)
   .then(res=>res.json())
   .then(userInfo=>{
    myUserObj = userInfo
    myUserName = userInfo.username
}) 
}

function getAllBookTitles(){
    fetch ("http://localhost:3000/books")
    .then(res=>res.json())
    .then(bookData=> bookData.forEach(book=>renderBookTitles(book)))
}

function renderBookTitles(bookObj){
    let bookTitle = document.createElement("li")
    bookTitle.id = bookObj.id
    bookTitle.textContent = bookObj.title
    bookTitle.addEventListener("click", e => getSpecificBook(e))
    document.getElementById("list").appendChild(bookTitle)
}

function getSpecificBook(event){
    document.getElementById("show-panel").innerHTML = ""
    fetch (`http://localhost:3000/books/${event.target["id"]}`)
    .then(res=>res.json())
    .then(bookInfo=> {showBookCard(bookInfo)})
}

function showBookCard(bookObj){
    document.getElementById("show-panel").innerHTML = ""
    let bookCard = document.createElement("div")
    bookCard.innerHTML = `
        <img src=${bookObj.img_url}>
        <h1>${bookObj.title}</h1>
        <h2>${bookObj.subtitle}</h2>
        <h3>By ${bookObj.author}</h3>
        <p>${bookObj.description}</p>
        <ul id="user-list"></ul>
        <button>LIKE</button>
    `
    //appends users to user-list and adjusts button text if my user has liked the selected book
    bookObj.users.forEach(user => {
        let userName = document.createElement("li")
        userName.textContent = user.username
        bookCard.querySelector("#user-list").appendChild(userName)
        if (user.username === myUserName){
            bookCard.querySelector("button").textContent = `DISLIKE`
        }
    })

    //button toggle between like and dislike and update the API accordingly
    bookCard.querySelector("button").addEventListener("click", e => {
        if (e.target.textContent === `LIKE`){
            bookCard.querySelector("button").textContent = "DISLIKE"
            //adds user to user list of bookObj
            bookObj.users.push(myUserObj)

            fetch (`http://localhost:3000/books/${bookObj.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type":"application/json",
                    Accept:"application/json"
                },
                body: JSON.stringify({
                   users: bookObj.users 
                })
            })
            .then(res=>res.json())
            .then(newBookInfo=>showBookCard(newBookInfo))

        } else if (e.target.textContent === `DISLIKE`){
            bookCard.querySelector("button").textContent = "LIKE"
            // removes me from API and then reposts book with updated user list
            fetch (`http://localhost:3000/books/${bookObj.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type":"application/json",
                    Accept:"application/json"
                },
                body: JSON.stringify({
                   users: bookObj.users.filter(user=> user.username !== myUserName)
                })
            })
            .then(res=>res.json())
            .then(newBookInfo=>showBookCard(newBookInfo))
        }


    })

    // append bookCard to show-panel to display book info and users
    document.getElementById("show-panel").appendChild(bookCard)
}

