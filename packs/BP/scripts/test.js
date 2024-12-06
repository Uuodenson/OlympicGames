const promise = new Promise((resolve) => {
    setTimeout(() => {
        resolve(true)
    }, 1000)
})

promise.then((result) => {
    console.log(result)
})