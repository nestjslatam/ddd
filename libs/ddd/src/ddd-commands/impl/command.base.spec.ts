import { CommandBase } from './command.base';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid');

describe('CommandBase', () => {
    const mockUuid = '123e4567-e89b-12d3-a456-426614174000';

    beforeEach(() => {
        (uuidv4 as jest.Mock).mockReturnValue(mockUuid);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a command with default metadata', () => {
        const props = {};
        const command = new CommandBase(props);

        expect(command.metadata.id).toBe(mockUuid);
        expect(command.metadata.trackingId).toBeUndefined();
        expect(uuidv4).toHaveBeenCalled();
    });

    it('should create a command with provided trackingId', () => {
        const trackingId = 'tracking-123';
        const props = { metadata: { trackingId } };
        const command = new CommandBase(props);

        expect(command.metadata.id).toBe(mockUuid);
        expect(command.metadata.trackingId).toBe(trackingId);
    });
});
