import React, { useContext } from "react";
import { useActor } from "@xstate/react";
import { Modal } from "react-bootstrap";
import classNames from "classnames";

import { Context } from "features/game/GameProvider";

import market from "assets/buildings/market.png";
import plant from "assets/icons/plant.png";

import sunflower from "assets/crops/sunflower/crop.png";
import pumpkin from "assets/crops/pumpkin/crop.png";
import cauliflower from "assets/crops/cauliflower/crop.png";
import bobMarley from "assets/npcs/bob_marley.gif";

import { GRID_WIDTH_PX } from "features/game/lib/constants";
import { Action } from "components/ui/Action";

import { MarketItems } from "./MarketItems";

export const Market: React.FC = () => {
  const { gameService } = useContext(Context);
  const [gameState] = useActor(gameService);
  const [isOpen, setIsOpen] = React.useState(false);

  const isNotReadOnly = !gameState.matches("readonly");

  return (
    <div
      style={{
        width: `${GRID_WIDTH_PX * 3.2}px`,
        position: "absolute",
        left: `${GRID_WIDTH_PX * 16}px`,
        bottom: `${GRID_WIDTH_PX * 2.2}px`,
      }}
    >
      <img
        src={market}
        alt="market"
        onClick={isNotReadOnly ? () => setIsOpen(true) : () => {}}
        className={classNames(" w-full", {
          "cursor-pointer": isNotReadOnly,
          "hover:img-highlight": isNotReadOnly,
        })}
      />
      <img
        src={bobMarley}
        alt="bobMarley"
        className="absolute pointer-events-none"
        style={{
          width: `${GRID_WIDTH_PX * 1.8}px`,
          position: "absolute",
          left: `${GRID_WIDTH_PX * 0.7}px`,
          bottom: `${GRID_WIDTH_PX * 0.8}px`,
        }}
      />
      <img
        src={sunflower}
        alt="sunflower"
        className="w-6 absolute bottom-6 left-2 pointer-events-none"
      />
      <img
        src={pumpkin}
        alt="pumpkin"
        className="w-6 absolute bottom-6 left-14 pointer-events-none"
      />
      <img
        src={cauliflower}
        alt="cauliflower"
        className="w-6 absolute bottom-6 right-2 pointer-events-none"
      />
      {isNotReadOnly && (
        <Action
          className="absolute -bottom-3 left-6"
          text="Shop"
          icon={plant}
          onClick={() => setIsOpen(true)}
        />
      )}
      <Modal centered show={isOpen} onHide={() => setIsOpen(false)}>
        <MarketItems onClose={() => setIsOpen(false)} />
      </Modal>
    </div>
  );
};
