module.exports = function(req,res,nex){
    res.status(404).render('404', {
        title: "Страница не найдена"
    })
}
