import { shallowMount } from '@vue/test-utils';
import CardRemoveModal from '@/components/CardRemoveModal.vue';

describe('CardRemoveModal.vue', () => {
  let wrapper;

  describe('when api responds with 404 status', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 404 }));

      wrapper = shallowMount(CardRemoveModal, {
        global: { provide: { backendUrl: '' } },
        props: {
          cardId: 523,
          closeModal: global.closeModal = jest.fn(),
          deleteCard: global.deleteCard = jest.fn(),
        },
      });
    });

    it('renders', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('fetches a card by the correct id', () => {
      expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/cards/523');
    });

    it('displays "no-card-banner" with the correct text', () => {
      expect(wrapper.get('h2.no-card-banner').text()).toBe('The card was not found :(');
    });
  });

  describe('when api responds with a card', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        json: () => ({
          id: 42,
          text: 'some text',
          translation: 'some translation',
          image_path: null,
          met_at: '2022-02-12 09:00:13 UTC',
          remembered: true,
          active: true,
          created_at: '2022-02-11 14:58:09 UTC',
          updated_at: '2022-02-12 09:00:13 UTC',
        }),
      }));

      wrapper = shallowMount(CardRemoveModal, {
        global: { provide: { backendUrl: '' } },
        props: {
          cardId: 42,
          closeModal: global.closeModal = jest.fn(),
          deleteCard: global.deleteCard = jest.fn(),
        },
      });
    });

    it('renders', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('fetches a card by the correct id', () => {
      expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/cards/42');
    });

    it('displays the correct card id', () => {
      expect(wrapper.get('div.card-remove.remembered h4').text()).toBe('#42');
      expect(wrapper.get('div.card-remove.remembered h4').attributes()).toEqual({ title: '#42' });
    });

    it('displays the correct message', () => {
      expect(wrapper.get('div.card-remove.remembered p.message').text()).toBe(
        'Are you sure want to delete the card?',
      );
    });

    it('displays the no button', async () => {
      expect(wrapper.get('div.card-remove.remembered button.btn.no-btn').text()).toBe('No');
      expect(global.closeModal).toHaveBeenCalledTimes(0);

      jest.useFakeTimers();
      await wrapper.get('div.card-remove.remembered button.btn.no-btn').trigger('click');
      jest.runAllTimers();

      expect(global.closeModal).toHaveBeenNthCalledWith(1);
    });

    it('displays the yes button', async () => {
      expect(wrapper.get('div.card-remove.remembered button.btn.yes-btn').text()).toBe('Yes');
      expect(global.deleteCard).toHaveBeenCalledTimes(0);

      await wrapper.get('div.card-remove.remembered button.btn.yes-btn').trigger('click');
      expect(global.deleteCard).toHaveBeenNthCalledWith(1, 42);
    });
  });
});
