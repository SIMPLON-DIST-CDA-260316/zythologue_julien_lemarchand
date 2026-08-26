export class ResourceNotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`);
    this.name = "ResourceNotFoundError";
    this.resource = resource;
    this.id = id;
  }
}
