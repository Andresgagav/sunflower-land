import { Modal } from "components/ui/Modal";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import React, { useState } from "react";
// import giftIcon from "assets/icons/gift.png";
import vipGift from "assets/decorations/vip_gift.png";
import loveBox from "assets/decorations/love_box.webp";
import lockIcon from "assets/icons/lock.png";
import { DailyRewardContent } from "../../../../game/expansion/components/dailyReward/DailyReward";
import { SUNNYSIDE } from "assets/sunnyside";
import { TaskBoard } from "./TaskBoard";
import { SocialTaskName } from "features/game/events/landExpansion/completeSocialTask";
import { MachineInterpreter } from "features/game/lib/gameMachine";
import { GameState } from "features/game/types/game";
import {
  DailyRewardContext,
  DailyRewardEvent,
  DailyRewardState,
} from "features/game/expansion/components/dailyReward/rewardChestMachine";
import {
  Interpreter,
  ResolveTypegenMeta,
  TypegenDisabled,
  BaseActionObject,
  ServiceMap,
  State,
} from "xstate";
import Decimal from "decimal.js-light";
import { Label } from "components/ui/Label";
import { ButtonPanel } from "components/ui/Panel";
import { getSeasonalTicket } from "features/game/types/seasons";
import { VIPGiftContent } from "features/world/ui/VIPGift";
import { BlockchainBox } from "./BlockchainBox";
import { hasFeatureAccess } from "lib/flags";
import { hasVipAccess } from "features/game/lib/vipAccess";
import { useTranslation } from "react-i18next";

interface Props {
  show: boolean;
  onHide: () => void;
  gameService: MachineInterpreter;
  state: GameState;
  isRevealed: boolean;
  bumpkinLevel: number;
  chestService: Interpreter<
    DailyRewardContext,
    any,
    DailyRewardEvent,
    DailyRewardState,
    ResolveTypegenMeta<
      TypegenDisabled,
      DailyRewardEvent,
      BaseActionObject,
      ServiceMap
    >
  >;
  chestState: State<
    DailyRewardContext,
    DailyRewardEvent,
    any,
    DailyRewardState,
    ResolveTypegenMeta<
      TypegenDisabled,
      DailyRewardEvent,
      BaseActionObject,
      ServiceMap
    >
  >;
  completeTask: (taskId: SocialTaskName) => void;
  loveCharmCount: Decimal;
  socialTasks?: GameState["socialTasks"];
  isChestLocked: boolean;
  isAnyTaskCompleted: boolean;
}

export const Rewards: React.FC<Props> = ({
  show,
  onHide,
  gameService,
  state,
  isRevealed,
  bumpkinLevel,
  chestService,
  chestState,
  completeTask,
  loveCharmCount,
  socialTasks,
  isChestLocked,
  isAnyTaskCompleted,
}) => {
  const [tab, setTab] = useState<"Earn" | "Rewards">("Earn");
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={onHide}>
      <CloseButtonPanel
        tabs={[
          {
            icon: SUNNYSIDE.ui.board,
            name: "Earn",
            alert: isAnyTaskCompleted,
          },
          {
            icon: SUNNYSIDE.decorations.treasure_chest,
            name: "Rewards",
            alert: isChestLocked,
          },
        ]}
        currentTab={tab}
        setCurrentTab={setTab}
        onClose={onHide}
      >
        {tab === "Earn" && (
          <TaskBoard
            state={state}
            completeTask={completeTask}
            socialTasks={socialTasks}
            loveCharmCount={loveCharmCount}
          />
        )}
        {tab === "Rewards" && (
          <RewardOptions
            onHide={onHide}
            gameService={gameService}
            state={state}
            isRevealed={isRevealed}
            bumpkinLevel={bumpkinLevel}
            chestService={chestService}
            chestState={chestState}
            completeTask={completeTask}
            isAnyTaskCompleted={isAnyTaskCompleted}
            loveCharmCount={loveCharmCount}
            isChestLocked={isChestLocked}
            show={show}
          />
        )}
        {/* {tab === 2 && <RewardsShop />} */}
      </CloseButtonPanel>
    </Modal>
  );
};

export type RewardType = "DAILY_REWARD" | "VIP" | "BLOCKCHAIN_BOX";

export const RewardOptions: React.FC<Props> = ({
  onHide,
  gameService,
  state,
  isRevealed,
  bumpkinLevel,
  chestService,
  chestState,
}) => {
  const [selected, setSelected] = useState<RewardType>();
  const { t } = useTranslation();

  if (selected === "DAILY_REWARD") {
    return (
      <DailyRewardContent
        onClose={() => setSelected(undefined)}
        gameService={gameService}
        dailyRewards={state.dailyRewards}
        isRevealed={isRevealed}
        bumpkinLevel={bumpkinLevel}
        chestService={chestService}
        chestState={chestState}
      />
    );
  }

  if (selected === "VIP") {
    return <VIPGiftContent onClose={() => setSelected(undefined)} />;
  }

  if (selected === "BLOCKCHAIN_BOX") {
    return <BlockchainBox onClose={() => setSelected(undefined)} />;
  }

  const vipOpenedAt = state.pumpkinPlaza.vipChest?.openedAt ?? 0;

  const hasOpenedVIP =
    !!vipOpenedAt &&
    new Date(vipOpenedAt).toISOString().substring(0, 7) ===
      new Date().toISOString().substring(0, 7);

  const today = new Date().toISOString().substring(0, 10);
  const hasOpenedDaily =
    new Date(state.dailyRewards?.chest?.collectedAt ?? 0)
      .toISOString()
      .substring(0, 10) === today;

  return (
    <>
      <Label type="default" className="mb-1">
        {t("rewards.claim.title")}
      </Label>

      {hasFeatureAccess(state, "BLOCKCHAIN_BOX") && (
        <ButtonPanel
          onClick={() => setSelected("BLOCKCHAIN_BOX")}
          className="mb-1"
        >
          <div className="flex items-start">
            <img src={loveBox} className="w-10 mr-4" />
            <div className="relative flex-1">
              <p className="text-sm mb-1">
                {t("rewards.blockchain.box.title")}
              </p>
              <p className="text-xs">
                {t("rewards.blockchain.box.description")}
              </p>
            </div>
            {state.pumpkinPlaza.blockchainBox ? (
              <Label className="absolute top-0 right-0" type="success">
                {t("rewards.blockchain.box.claimed")}
              </Label>
            ) : (
              <Label className="absolute top-0 right-0" type="info">
                {t("rewards.blockchain.box.limited")}
              </Label>
            )}
          </div>
        </ButtonPanel>
      )}

      <ButtonPanel onClick={() => setSelected("DAILY_REWARD")} className="mb-1">
        <div className="flex items-start">
          <img
            src={SUNNYSIDE.decorations.treasure_chest}
            className="w-10 mr-4"
          />
          <div className="relative flex-1">
            <p className="text-sm mb-1">{t("rewards.daily.title")}</p>
            <p className="text-xs">
              {t("rewards.daily.description", { ticket: getSeasonalTicket() })}
            </p>
          </div>
          {hasOpenedDaily && (
            <Label className="absolute top-0 right-0" type="success">
              {t("rewards.daily.claimed")}
            </Label>
          )}
        </div>
      </ButtonPanel>

      <ButtonPanel onClick={() => setSelected("VIP")}>
        <div className="flex items-start">
          <img src={vipGift} className="w-10 mr-4" />
          <div className="relative flex-1">
            <p className="text-sm mb-1">{t("rewards.vip.title")}</p>
            <p className="text-xs">{t("rewards.vip.description")}</p>
          </div>
          {hasOpenedVIP && (
            <Label className="absolute top-0 right-0" type="success">
              {t("rewards.vip.claimed")}
            </Label>
          )}
          {!hasOpenedVIP && !hasVipAccess({ game: state, now: Date.now() }) && (
            <Label
              icon={lockIcon}
              className="absolute top-0 right-0"
              type="formula"
            >
              {t("rewards.vip.locked")}
            </Label>
          )}
        </div>
      </ButtonPanel>
    </>
  );
};
