module.exports = function(req,res,nex){
    return res.status(404).render('404', {
        title: "Страница на найдена"
    })
}
