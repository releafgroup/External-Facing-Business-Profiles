app.use('/', routes);                                                                                  
app.use('/users', users);                                                                              
app.use('/authenticate', auth);                                                                        
app.use(authfunc);