import { shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import Edit from '@/views/Edit.vue';

describe('Edit.vue', () => {
  let wrapper;

  describe('when api responds with some cards', () => {
    beforeEach(async () => {
      global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        json: () => ([
          {
            id: 89,
            text: 'some text 1',
            translation: 'some translation 1',
            image_path: null,
            met_at: '2022-02-13 13:29:08 UTC',
            remembered: true,
            active: false,
            created_at: '2022-02-11 20:04:45 UTC',
            updated_at: '2022-02-13 13:30:50 UTC',
          },
          {
            id: 90,
            text: 'some text 2',
            translation: 'some translation 2',
            image_path: '/storage/card_90.jpeg',
            met_at: '2022-02-13 13:29:44 UTC',
            remembered: false,
            active: true,
            created_at: '2022-02-11 20:05:38 UTC',
            updated_at: '2022-02-13 13:30:44 UTC',
          },
        ]),
      }));

      wrapper = shallowMount(Edit, {
        global: {
          provide: { backendUrl: '' },
          stubs: [
            'router-link', 'SearchIcon', 'ClearIcon', 'CheckIcon', 'AddIcon',
            'VisibilityIcon', 'VisibilityOffIcon', 'InfoIcon', 'CardInfoModal', 'CardRemoveModal',
          ],
        },
      });

      await flushPromises();
    });

    it('renders', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('fetches cards by the correct endpoint', () => {
      expect(global.fetch.mock.calls.length).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/cards');
    });
  });
});
