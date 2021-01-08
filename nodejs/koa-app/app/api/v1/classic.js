const Router = require('koa-router')
const {
    Auth
} = require('@middlewares/auth')
const router = new Router({
    prefix: '/v1/classic'
})
const {
    Flow
} = require('@models/flow')
const {
    Art
} = require('@models/art')
const {
    Favor
} = require('@models/favor')
const {
    PositiveInterValidator,
    ClassicValidator,
} = require('@validators/validator')


router.get('/latest', new Auth().m, async (ctx, next) => {
    const flow = await Flow.findOne({
        order: [
            ['index', 'DESC']
        ]
    })
    if (!flow) {
        throw new global.infos.NotFound()
    }
    const art = await Art.getTypeData(flow.artId, flow.type)
    const isLike = await Favor.userLikeIt(flow.artId, flow.type, ctx.auth.uid)
    art.setDataValue('index', flow.index)
    art.setDataValue('likeStatus', isLike)
    ctx.body = new global.infos.Success(art)
});

router.get('/:index/next', new Auth().m, async (ctx) => {
    const v = await new PositiveInterValidator().validate(ctx, {
        id: 'index'
    })
    const index = v.get('path.index')
    const flow = await Flow.findOne({
        where: {
            index: index + 1
        }
    })
    const art = await Art.getTypeData(flow.artId, flow.type)
    const isLike = await Favor.userLikeIt(flow.artId, flow.type, ctx.auth.uid)
    art.setDataValue('index', flow.index)
    art.setDataValue('likeStatus', isLike)
    ctx.body = new global.infos.Success(art)
})

router.get('/:index/prev', new Auth().m, async (ctx) => {
    const v = await new PositiveInterValidator().validate(ctx, {
        id: 'index'
    })
    const index = v.get('path.index')
    const flow = await Flow.findOne({
        where: {
            index: index - 1
        }
    })
    const art = await Art.getTypeData(flow.artId, flow.type)
    const isLike = await Favor.userLikeIt(flow.artId, flow.type, ctx.auth.uid)
    art.setDataValue('index', flow.index)
    art.setDataValue('likeStatus', isLike)
    ctx.body = new global.infos.Success(art)
})

router.get('/:type/:id/favor', new Auth().m, async ctx => {
    const v = await new ClassicValidator().validate(ctx)
    const id = v.get('path.id')
    const type = v.get('path.type')
    const art = await Art.getTypeData(id, type)
    if (!art) {
        throw new global.infos.NotFoundError()
    }                                                                          
    const isLike = await Favor.userLikeIt(id, type, ctx.auth.uid)
    ctx.body = new global.infos.Success({
        favNums: art.favNums,
        likeStatus: isLike
    })
})

router.get('/:type/:id/detail', new Auth().m, async ctx => {
    const v = await new ClassicValidator().validate(ctx)
    const id = v.get('path.id')
    const type = v.get('path.type')
    const art = await Art.getTypeData(id, type)
    if (!art) {
        throw new global.infos.NotFoundError()
    }
    const isLike = await Favor.userLikeIt(id, type, ctx.auth.uid)
    ctx.body = new global.infos.Success({
         ...art.dataValues,
        likeStatus: isLike
    })
})


router.get('/favorList', new Auth().m, async ctx => {
    const favorLists = await Favor.getMyClassicFavors(ctx.auth.uid)
    if (!favorLists) {
        throw new global.infos.NotFoundError()
    }
    ctx.body = new global.infos.Success(favorLists)
})


module.exports = router