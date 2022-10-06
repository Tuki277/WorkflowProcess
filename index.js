const express = require('express');
const app = express();
const PORT = 8000;
const processWorkflow = require('./processWorkflow');
const connectDB = require('./connect');
const router = express.Router();
const controller = require('./controller/index');

app.use(express.json());

connectDB();

app.use('/api', router);
router.post('/processwf', processWorkflow.index);
router.route('/content')
    .get(controller.getContent)
    .post(controller.postContent)
    .put()
    .delete()

router.post('/workflowprocess/:id', controller.getContentDetailById);

router.route('/workflowconfig')
    .get(controller.getWorkflowConfig)
    .post(controller.postWorkflowConfig)
    .put()
    .delete()

router.get('/workflowconfig/:id', controller.getWorkflowById);
router.post('/workflowprocess/:id/update', controller.updateStepOfContent);

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    const error = req.app.get('env') === 'development' ? err : {};
    const status = err.status || 500

    // render the error page
    return res.status(status).json({
        error: {
            message: error.message
        }
    })
});

app.listen(PORT, () => console.log("server run ...."))