const mongoose = require('mongoose')

exports.dbConnection = async (app, PORT) => {
    try {
        const connection = await mongoose.connect(process.env.DB_URI)
        
        if(!connection || connection.error){
            console.log("Faild to connect to database",error);
            return {connection}
        }

        console.log('Database Connected!');
        
        app.listen(PORT, () => {
            console.log(`Server started at port ${PORT}`);
        })
    } catch (error) {
        console.log("Faild to connect to database",error);
        
        return {error}
    }
}