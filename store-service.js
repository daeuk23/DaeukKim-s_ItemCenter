  const Sequelize = require('sequelize');

	var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'q0kC5cjasQUy', {
    host: 'ep-holy-star-a5d64zxy.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define
const Item = sequelize.define('Item', {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
  price: Sequelize.DOUBLE
});
const Category = sequelize.define('Category', {
  category: Sequelize.STRING
});
// BelongsTo
Item.belongsTo(Category, { foreignKey: 'category' });

//initialize for connecting db using resolve/reject
async function initialize() {
  try {
    // Calling the sequelize.sync() function to connect to the database and represent Item and Category models in the database as tables.
    await sequelize.sync();
    // If the sync() operation is resolved successfully
    return Promise.resolve("Database synced successfully.");
  } catch (error) {
    // If there was an error during the operation
    return Promise.reject("Unable to sync the database: " + error.message);
  }
}

//should return promise with resolve func
async function getAllItems() {
  return new Promise(function(resolve, reject) {
  Item.findAll()
      .then(items => {
        // case error calling items
        if (items && items.length > 0) {
          resolve(items);
        } else {
          // If no items 
          reject("No items found");
        }
      })
      .catch(error => {
        // If an error occurs err msg
        reject("Error fetching items: " + error.message);
      });
    });
}


async function getItemsByCategory(category) {
  return new Promise(function(resolve, reject) {
    // Invoke the Item.findAll() function and filter the results by "category"
    Item.findAll({
            where: { category: category } 
        })
        .then(items => {
            // If the Item.findAll() operation resolved successfully
            resolve(items);
        })
        .catch(error => {
            // If there was an error at any time during this process
            reject("Error retrieving items by category: " + error.message);
        });
});
}

async function getItemsByMinDate(minDateStr) {
  try {
    // Define the Sequelize operator 'gte'
    const { Op } = require('sequelize');
    const { gte } = Op;

    // Invoke the Item.findAll() function and filter the results 
    const itemsByMinDate = await Item.findAll({
      where: {
        postDate: {
          [gte]: new Date(minDateStr)
        }
      }
    });

    // If the Item.findAll() operation resolved successfully
    return Promise.resolve(itemsByMinDate);
  } catch (error) {
    // If there was an error at any time during this process
    return Promise.reject("Error retrieving items by minimum date: " + error.message);
  }
}

async function getItemById(id) {
  try {
    // Invoke the Item.findAll() function and filter the results by "id"
    const itemById = await Item.findAll({ where: { id: id } });

    // If the Item.findAll() operation resolved successfully
    if (itemById && itemById.length > 0) {
      return Promise.resolve(itemById[0]); 
    } else {
      // If no items are found
      return Promise.reject("No item found for id: " + id);
    }
  } catch (error) {
    // If there was an error at any time during this process
    return Promise.reject("Error retrieving item by id: " + error.message);
  }
}

/*async function addItem(itemData) {
  try {
    // Ensure that the published property is set properly
    itemData.published = (itemData.published) ? true : false;

    for (let key in itemData) {
      if (itemData[key] === "") {
        itemData[key] = null;
      }
    }

    // Assign a value for postDate
    itemData.postDate = new Date();

    // Invoke the Post.create() function -> new item
    await Post.create(itemData);

    // If the Post.create() operation resolved successfully
    return Promise.resolve();
  } catch (error) {
    // If there was an error at any time during this process
    return Promise.reject("Unable to create post: " + error.message);
  }
}*/

async function addItem(itemData) {
  try {
    // Ensure the published property is set properly
    itemData.published = (itemData.published) ? true : false;

    // Iterate over every property in itemData to check for empty values and replace them with null
    for (let key in itemData) {
      if (itemData[key] === "") {
        itemData[key] = null;
      }
    }

    // Assign a value for postDate (current date)
    itemData.postDate = new Date();

    // Get the last item ID
    const lastItem = await Item.findOne({ order: [['id', 'DESC']] });
    let newItemId = 1;
    if (lastItem) {
      newItemId = lastItem.id + 1;
    }

    // Assign the new item ID
    itemData.id = newItemId;

    // Invoke Item.create() function
    await Item.create(itemData);

    // If Item.create() operation resolved successfully
    return Promise.resolve();
  } catch (error) {
    // If an error occurs during the process
    return Promise.reject("Unable to create post: " + error.message);
  }
}


async function getPublishedItems() {
  return new Promise(function(resolve, reject) {
    // Invoke the Post.findAll() function and filter the results by "published" set to true
    Item.findAll({
            where: {
                published: true
            }
        })
        .then(items => {
            // If the Post.findAll() operation resolved successfully
            resolve(items);
        })
        .catch(error => {
            // If there was an error at any time during this process
            reject("Error retrieving published items: " + error.message);
        });
});
}

async function getPublishedItemsByCategory(category) {
  return new Promise(function(resolve, reject) {
    // Invoke the Post.findAll() function and filter the results by "published" set to true and "category" as specified
    Item.findAll({ where: { published: true, category: category } })
        .then(items => {
            // If the Post.findAll() operation resolved successfully
            resolve(items);
        })
        .catch(error => {
            /// If there was an error at any time during this process
            reject("no results returned: " + category + ". Error: " + error.message);
        });
});
}

async function getCategories() {
  try {
    // Invoke the Category.findAll() function
    const categories = await Category.findAll();

    // If the Category.findAll() operation resolved successfully
    return Promise.resolve(categories);
  } catch (error) {
    // If there was an error at any time during this process
    return Promise.reject("Error retrieving categories: " + error.message);
  }
}

/*async function addCategory(categoryData) {
  return new Promise((resolve, reject) => {
    try {
      // Ensure that any blank values in categoryData 
      for (let key in categoryData) {
        if (categoryData[key] === "") {
          categoryData[key] = null;
        }
      }

      // Invoke the Category.create() function
      Category.create(categoryData)
        .then(() => {
          // If the Category.create() operation resolved successfully
          resolve("Category created successfully.");
        })
        .catch(error => {
          // If there was an error at any time during this process
          reject("Unable to create category: " + error.message);
        });
    } catch (error) {
      // If there was an error at any time during this process
      reject("Unable to create category: " + error.message);
    }
  });
}*/
//update numbering => count number from first (remove deleted Category data)
async function addCategory(categoryData) {
  return new Promise((resolve, reject) => {
    try {
      // Ensure that any blank values in categoryData 
      for (let key in categoryData) {
        if (categoryData[key] === "") {
          categoryData[key] = null;
        }
      }

      // Get the last category ID
      Category.findOne({ order: [['id', 'DESC']] })
        .then(lastCategory => {
          let newCategoryId = 1;
          if (lastCategory) {
            newCategoryId = lastCategory.id + 1;
          }

          // Assign the new category ID
          categoryData.id = newCategoryId;

          // Invoke the Category.create() function
          Category.create(categoryData)
            .then(() => {
              // If the Category.create() operation resolved successfully
              resolve("Category created successfully.");
            })
            .catch(error => {
              // If there was an error at any time during this process
              reject("Unable to create category: " + error.message);
            });
        })
        .catch(error => {
          // If there was an error at any time during this process
          reject("Unable to create category: " + error.message);
        });
    } catch (error) {
      // If there was an error at any time during this process
      reject("Unable to create category: " + error.message);
    }
  });
}

async function deleteCategoryById(id) {
  return new Promise((resolve, reject) => {
    try {
      // Invoke Category.destroy() function to delete the category by id
      Category.destroy({ where: { id: id } })
        .then(() => {
          resolve("Category deleted successfully.");
        })
        .catch(error => {
          // If there was an error during the operation
          reject(new Error("Unable to delete category: " + error.message));
        });
    } catch (error) {
      // If there was an error during the operation
      reject(new Error("Unable to delete category: " + error.message));
    }
  });
}

async function deletePostById(id) {
  /*return new Promise((resolve, reject) => {
    try {
      // Invoke Post.destroy() function to delete the post by id
      Post.destroy({ where: { id: id } })
        .then(() => {
          resolve("Post deleted successfully.");
        })
        .catch(error => {
          // If there was an error during the operation
          reject(new Error("Unable to delete post: " + error.message));
        });
    } catch (error) {
      // If there was an error during the operation
      reject(new Error("Unable to delete post: " + error.message));
    }
  });*/
  return new Promise(function(resolve, reject) {

    Item.destroy({ where: { id: id } })
        .then(() => {
            // If the Post was deleted successfully
            resolve();
        })
        .catch(error => {
           // If there was an error during the operation
            reject("Error deleting post: " + error.message);
        });
});
}
  
module.exports = {
    initialize,
    getAllItems,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    addItem,
    getPublishedItems,
    getPublishedItemsByCategory,
    getCategories,
    addCategory,
    deleteCategoryById,
    deletePostById
  };