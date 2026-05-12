import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import talentRouter from "./talent";
import startupsRouter from "./startups";
import rolesRouter from "./roles";
import swipesRouter from "./swipes";
import matchesRouter from "./matches";
import messagesRouter from "./messages";
import videosRouter from "./videos";
import notificationsRouter from "./notifications";
import subscriptionsRouter from "./subscriptions";
import aiRouter from "./ai";
import analyticsRouter from "./analytics";
import profileViewsRouter from "./profile-views";
import waitlistRouter from "./waitlist";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(talentRouter);
router.use(startupsRouter);
router.use(rolesRouter);
router.use(swipesRouter);
router.use(matchesRouter);
router.use(messagesRouter);
router.use(videosRouter);
router.use(notificationsRouter);
router.use(subscriptionsRouter);
router.use(aiRouter);
router.use(analyticsRouter);
router.use(profileViewsRouter);
router.use(waitlistRouter);

export default router;
