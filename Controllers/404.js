exports.pagenotfound=(req,res,next)=>
{
    res.render('404',{pageTitle:'page not found'});
}

exports.connectionIssues=(req,res,next)=>
{
    res.render('500',{pageTitle:'page not found'});
}