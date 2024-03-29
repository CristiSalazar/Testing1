import usersModel from './models/users.model.js'

export default class Users {
    constructor() {

    }

    get = async () => {
        try
        {
            let users = await usersModel.find()
            return users
        }catch (error) {
            console.error('Error al obtener usuario:', error);
            return null
        }       
    }

    getUserById = async (id) => { 
      try 
      {
        const user = await usersModel.findById( id).lean();    
        if (!user) 
        {
          return 'Usuario no encontrado';
        }   
        return user;
      } catch (error) {
        console.error('Error al obtener usuario:', error);
        return null
      }
    }

    findEmail = async (param) => {
        try
        {
            const user = await usersModel.findOne(param)  
            return user
        }catch (error) {
            console.error('Error al buscar email:', error);
            return "error"
        }   
        
    }
    addUser = async (userData) => {
        try
        {
            let userCreate = await usersModel.create(userData);
            return userCreate
        }catch(error){
            console.error('Error al crear usuario:', error);
            return null;
        }      
    }
    findJWT = async (filterFunction) => {
        try
        {
            const user = await usersModel.find(filterFunction)
            return user
        }catch(error){
            console.error('Error JWT:', error);
        }      
    }

    getUserRoleByEmail = async (email) => {
        try {
          const user = await usersModel.findOne({ email });
      
          if (user && user.rol === 'premium') {
            return 'premium'
          } else {
            return "usuario no premium"
          }
        } catch (error) {
          return 'Error al obtener el rol';
        }
      };

    updateLastConnection = async (email) => {
        try {
          const updatedUser = await usersModel.findOneAndUpdate(
            { email: email },
            { $set: { last_connection: new Date() } },
            { new: true }
          );
      
          if (updatedUser) {
            return updatedUser;
          } else {
            console.error('Usuario no encontrado');
            return null;
          }
        } catch (error) {
          console.error('Error al actualizar la última conexión:', error);
          throw error;
        }
      }; 

      deleteUser = async (userId) => {
        try {
            const idToDelete = typeof userId === 'object' ? userId.id : userId;
            let deletedUser = await usersModel.deleteOne({ _id: idToDelete });
            return deletedUser;
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            return 'Error eliminando';
        }
      };
    
    updateDocuments = async (userId, newDocuments) => {
        try {
          const user = await usersModel.findById(userId);
          if (!user) {
            console.error('Usuario no encontrado');
            return null;
          }
          if (!Array.isArray(user.documents)) {
            user.documents = [];
          }
          user.documents.push(...(Array.isArray(newDocuments) ? newDocuments : [newDocuments]));
          const updatedUser = await user.save();
          return updatedUser;
        } catch (error) {
          console.error('Error actualizando los documentos:', error);
          throw error;
        }
      };

      hasDocuments = async (userId) => {
        try {
          const user = await usersModel.findById(userId);
          if (!user || !Array.isArray(user.documents)) {
            return false; 
          }

          const documentNames = ['identificacion', 'comprobante_domicilio', 'comprobante_estado_cuenta'];
      
          for (const documentName of documentNames) {
            const hasDocument = user.documents.some(doc => doc.name === documentName);
            if (!hasDocument) {
              return false; 
            }
          }
          return true; 
        } catch (error) {
          console.error('Error verificando los documentos:', error);
          throw error;
        }
      };
}