const urlsForUser = (user,data) => {
  let userUrls = {}
  for(let id in data){
    if(data[id]['userId'] === user){
      userUrls[id] = data[id]['longURL']
    }
  }
  return userUrls
}

const getUserByEmail = function(email, data) {
  for(let userId in data){
    if(data[userId]['email'] === email){
      return userId
    }
  }
  return false;
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(7);
}

module.exports = {urlsForUser, getUserByEmail, generateRandomString}