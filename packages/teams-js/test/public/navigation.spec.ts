import * as utilFunc from '../../src/internal/utils';
import { FrameContexts } from '../../src/public';
import { navigateBack, navigateCrossDomain, navigateToTab, returnFocus } from '../../src/public/navigation';
import { _uninitialize } from '../../src/public/publicAPIs';
import { Utils } from '../utils';

describe('MicrosoftTeams-Navigation', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
    utils.mockWindow.parent = utils.parentWindow;
  });
  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  describe('Testing navigation.returnFocus function', () => {
    const allowedContexts = [FrameContexts.content];

    it('navigation.returnFocus should not allow calls before initialization', () => {
      expect(() => returnFocus(true)).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
        it(`navigation.returnFocus should successfully returnFocus when set to true and initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          returnFocus(true);

          const returnFocusMessage = utils.findMessageByFunc('returnFocus');
          expect(returnFocusMessage).not.toBeNull();
          expect(returnFocusMessage.args.length).toBe(1);
          expect(returnFocusMessage.args[0]).toBe(true);
        });

        it(`navigation.returnFocus should successfully returnFocus when set to false and initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          returnFocus(false);

          const returnFocusMessage = utils.findMessageByFunc('returnFocus');
          expect(returnFocusMessage).not.toBeNull();
          expect(returnFocusMessage.args.length).toBe(1);
          expect(returnFocusMessage.args[0]).toBe(false);
        });
      } else {
        it(`navigation.returnFocus should not allow calls when set to true and initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => returnFocus(true)).toThrow(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });

        it(`navigation.returnFocus should not allow calls when set to false and initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => returnFocus(false)).toThrow(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing navigation.navigateToTab function', () => {
    it('navigation.navigateToTab should not allow calls before initialization', () => {
      expect(() => navigateToTab(null)).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      it(`navigation.navigateToTab should register the navigateToTab action when initialized with ${context} context`, () => {
        utils.initializeWithContext(context);
        navigateToTab(null);
        const navigateToTabMsg = utils.findMessageByFunc('navigateToTab');
        expect(navigateToTabMsg).not.toBeNull();
      });
    });
  });

  describe('Testing navigation.navigateCrossDomain function', () => {
    const allowedContexts = [
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.settings,
      FrameContexts.remove,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    ];

    it('navigation.navigateCrossDomain should not allow calls before initialization', () => {
      expect(() => navigateCrossDomain('https://valid.origin.com')).toThrowError(
        'The library has not yet been initialized',
      );
    });

    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
        it(`navigation.navigateCrossDomain should allow calls when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          navigateCrossDomain('https://valid.origin.com');
        });

        it(`navigation.navigateCrossDomain should successfully navigate cross-origin when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          navigateCrossDomain('https://valid.origin.com');

          const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
          expect(navigateCrossDomainMessage).not.toBeNull();
          expect(navigateCrossDomainMessage.args.length).toBe(1);
          expect(navigateCrossDomainMessage.args[0]).toBe('https://valid.origin.com');
        });

        it(`navigation.navigateCrossDomain should throw on invalid cross-origin navigation request when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          navigateCrossDomain('https://invalid.origin.com', (success, reason) => {
            expect(success).toBeFalsy();
            expect(reason).toBe(
              'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.',
            );
          });

          const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
          expect(navigateCrossDomainMessage).not.toBeNull();
          expect(navigateCrossDomainMessage.args.length).toBe(1);
          expect(navigateCrossDomainMessage.args[0]).toBe('https://invalid.origin.com');

          utils.respondToMessage(navigateCrossDomainMessage, false);
        });

        it(`navigation.navigateCrossDomain should call getGenericOnCompleteHandler when no callback is provided when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          jest.spyOn(utilFunc, 'getGenericOnCompleteHandler').mockImplementation(() => {
            return (success: boolean, reason: string): void => {
              if (!success) {
                expect(reason).toBe(
                  'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.',
                );
              }
            };
          });
          navigateCrossDomain('https://invalid.origin.com');

          const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
          expect(navigateCrossDomainMessage).not.toBeNull();
          expect(navigateCrossDomainMessage.args.length).toBe(1);
          expect(navigateCrossDomainMessage.args[0]).toBe('https://invalid.origin.com');

          utils.respondToMessage(navigateCrossDomainMessage, false);
        });
      } else {
        it(`navigation.navigateCrossDomain should not allow calls from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          expect(() => navigateCrossDomain('https://valid.origin.com')).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing navigate.navigateBack function', () => {
    it('navigation.navigateBack should not allow calls before initialization', () => {
      expect(() => navigateBack()).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      it(`navigate.navigateBack should register the navigateBack action when initialized with ${context} context`, () => {
        utils.initializeWithContext(context);
        navigateBack();
        const navigateBackMessage = utils.findMessageByFunc('navigateBack');
        expect(navigateBackMessage).not.toBeNull();
      });
    });
  });
});
