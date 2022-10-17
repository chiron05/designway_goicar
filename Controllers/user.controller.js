const User=require('../Models/User')

exports.getUsers = async (req, res) => {
    try {
        const users=await User.findAll()
        res.status(200).send(users)

    }
    catch (error) {
        res.status(500).send(error)
    }

}

exports.createUser = async (req, res) => {
    try {
        const user = await User.create(req.body)
        res.status(200).send(user)
    }
    catch (err) {
        res.status(500).send(err)
    }
}
exports.updateUser = async (req, res) => {

    try {
        await User.update(req.body,{
        where:{
            id:req.params.id
        }
    })
        res.status(200).send(` User ${req.params.id} updated`)

    }
    catch (error) {
        res.status(500).send(error)
    }

}
exports.deleteUser = async (req, res) => {
    try {
        await User.destroy({
        where:{
            id:req.params.id
        }
    })
        res.status(200).send(`User ${req.params.id} deleted`)

    }
    catch (error) {
        res.status(500).send(error)
    }
}

