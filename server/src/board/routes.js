const {router} = require('../app');

const BoardModel = require('./model');

router.head('/boards/:slug', (req, res) => {
  const slug = req.params.slug;

  BoardModel
    .findOne({
      slug: slug
    })
    .exec(function (err, doc) {
      if (err) throw err;
      if (doc) {
        console.log(doc._id, 'updatedAt =', doc.updatedAt);
        res.status(200)
          .set('Last-Modified-Iso', doc.updatedAt ? doc.updatedAt.toISOString() : (new Date(0)).toISOString())
          .end();
      } else {
        res.status(404)
          .end();
      }
    });
});

router.get('/boards/:slug', (req, res) => {
  const slug = req.params.slug;

  BoardModel
    .findOne({
      slug: slug
    })
    .populate('lists')
    .exec(function (err, doc) {
      if (err) throw err;
      if (doc) {
        console.log(doc);
        res.status(200)
          .json(doc);
      } else {
        const doc = new BoardModel(req.body);
        console.debug('GET BOARD (create new)', doc);
        doc.save(function (err) {
          if (err) throw err;
          res.status(201)
            .json(doc);
        });
      }
    });
});

router.post('/boards', (req, res) => {
  delete req.body._id;
  const doc = new BoardModel(req.body);
  console.debug('POST BOARD', doc);

  doc.save(function (err) {
    if (err) throw err;
    res.status(201)
      .json(doc);
  });
});
