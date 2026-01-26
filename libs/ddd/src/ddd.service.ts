/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";

@Injectable()
export class DddService {
  /**
   * Creates an instance of DddService.
   * @param modulesContainer - The container holding all the modules in the application.
   */
  constructor(private readonly modulesContainer: ModulesContainer) {}

  /**
   * Explores the modules and extracts the domain commands, domain events, and sagas.
   * @returns An object containing the extracted domain commands, domain events, and sagas.
   */
  explore(): void {
    return;
  }
}
