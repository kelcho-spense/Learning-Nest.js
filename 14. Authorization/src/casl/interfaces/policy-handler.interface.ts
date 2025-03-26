import { MongoAbility } from '@casl/ability';

interface IPolicyHandler {
  handle(ability: MongoAbility): boolean;
}

type PolicyHandlerCallback = (ability: MongoAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
