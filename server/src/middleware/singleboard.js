const {VUE_APP_SINGLEBOARD_ID, VUE_APP_SINGLEBOARD_SLUG} = require('../config');
const BoardModel = require('../board/model');
const ListModel = require("../list/model");
const ItemModel = require("../item/model");

const deniedReasonHeader = 'Not-In-Singleboard-Mode';

const ensureSingleBoardExists = async function () {
  return await BoardModel
    .findById(VUE_APP_SINGLEBOARD_ID)
    .exec()
    .then(function (err, doc) {
      if (err) throw err;
      if (!doc) {
        console.info('Singleboard does not exist. Force creation.');

        // Force create the board before continuing
        return (new BoardModel({
          _id: VUE_APP_SINGLEBOARD_ID,
          slug: VUE_APP_SINGLEBOARD_SLUG
        })).save();
      }
    });
};

const getList = async function (listId) {
  return await ListModel
    .findById(listId)
    .exec()
    .then((doc) => {
      if (doc && doc.boardId !== VUE_APP_SINGLEBOARD_ID) {
        throw new Error(deniedReasonHeader);
      }
      return doc;
    });
};

const getItem = async function (itemId) {
  return await ItemModel
    .findById(itemId)
    .exec()
    .then((doc) => {
      if (doc) {
        if (!doc.listId) {
          throw new Error(deniedReasonHeader);
        }
        getList(doc.listId);
      }
      return doc;
    });
};

module.exports = (router) => {
  //
  //  BOARDS MIDDLEWARE INTERCEPTORS
  //
  // HEAD + GET
  router.all('/boards/by-slug/:slug', function(req, res, next) {
    res.redirect(307, `/boards/${VUE_APP_SINGLEBOARD_ID}`);
  });
  // HEAD + GET
  router.all('/boards/:boardId', function(req, res, next) {
    if (req.params.boardId !== VUE_APP_SINGLEBOARD_ID) {
      res.status(404)
        .set('Osl-Reason', deniedReasonHeader)
        .end();
    } else {
      ensureSingleBoardExists()
        .then(() => next())
        .catch((err) => {
          console.error(err);
        });
      next();
    }
  });

  //
  //  LISTS MIDDLEWARE INTERCEPTORS
  //
  // HEAD + GET
  const listRequestMiddleware = (req, res, next) => {
    const listId = req.params.listId;

    getList(listId)
      .then((list) => {
        next();
      })
      .catch((err) => {
        res.status(404)
          .set('Osl-Reason', err)
          .end();
      });
  };
  router.head('/lists/:listId', listRequestMiddleware);
  router.get('/lists/:listId', listRequestMiddleware);

  // POST
  router.post('/lists', (req, res, next) => {
    if (req.body && req.body.boardId !== VUE_APP_SINGLEBOARD_ID) {
      res.status(403)
        .set('Osl-Reason', deniedReasonHeader)
        .end();
    } else {
      next();
    }
  });

  // PATCH
  router.patch('/lists', (req, res, next) => {
    if (req.body && req.body.boardId !== VUE_APP_SINGLEBOARD_ID) {
      res.status(403)
        .set('Osl-Reason', deniedReasonHeader)
        .end();
    } else {
      next();
    }
  });

  //
  //  ITEMS MIDDLEWARE INTERCEPTORS
  //
  // GET
  router.get('/lists/:listId/items', listRequestMiddleware);

  // POST
  router.post('/lists/:listId/items', listRequestMiddleware);
  router.post('/items', (req, res, next) => {
    if (req.body && req.body.listId) {
      getList(req.body.listId)
        .then(() => {
          next();
        })
        .catch((err) => {
          res.status(403)
            .set('Osl-Reason', err)
            .end();
        })
    } else {
      next();
    }
  });

  // PATCH
  router.patch('/items/:itemId', (req, res, next) => {
    const itemId = req.params.id;
    getItem(itemId)
      .then(() => {
        next();
      })
      .catch((err) => {
        res.status(403)
          .set('Osl-Reason', err)
          .end();
      });
  });
}
